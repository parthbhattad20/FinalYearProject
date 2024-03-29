import { Server } from 'socket.io';
import { ChildProcess, spawn } from 'child_process';
import { inputSettings , twitchSettings , youtubeSettings} from "./ffmpeg.js";

//import { createWorker } from './worker.js';
import config  from './soup_config.js';
import cors  from "cors";
import * as mediasoup from 'mediasoup';
 
let worker;
let router;
let rooms = {};          
let peers = {};          
let transports = [];     
let producers = [];      
let consumers = [];  
let producerTransportMap = {};

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
]
const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 10000,
    rtcMaxPort: 10200,
  })
  console.log(`worker pid ${worker.pid}`)
  
  worker.on('died', error => {
    console.error('mediasoup worker has died')
    setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
  })
  
  return worker
}

worker = createWorker();
const WebSocket=(()=>{
  
  const io = new Server(5001, {
    cors: {
      origin: '*',
    },
  });  
  
  io.on('connection', async (socket) => {
    console.log('Client connected');
    console.log(`socket connected to ${socket.id}`);
    socket.emit('connection-success', {
          socketId: socket.id
        })
        
        const removeItems = (items, socketId, type) => {
          items.forEach(item => {
            if (item.socketId === socket.id) {
              item[type].close()
            }
          })
          items = items.filter(item => item.socketId !== socket.id)
      
          return items
        }
        
        socket.on('disconnect', () => {
          console.log('peer disconnected');
          
          if (peers[socket.id]) {
            consumers = removeItems(consumers, socket.id, 'consumer');
            producers = removeItems(producers, socket.id, 'producer');
            transports = removeItems(transports, socket.id, 'transport');
            
            const { roomName } = peers[socket.id];
            delete peers[socket.id];
            
            // remove socket from room
            if (rooms[roomName]) {
              rooms[roomName] = {
                router: rooms[roomName].router,
                peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id),
              };
            }
          }
        });
        
        
        router = worker.createRouter({mediaCodecs , });
        
        socket.on('getRtpCapabilities', (callback) => {
          
          //const rtpCapabilities = JSON.stringify(router.rtpCapabilities);
          const rtpCapabilities = router.rtpCapabilities;
          
          console.log('rtp Capabilities', rtpCapabilities)
          
          // call callback from the client and send back the rtpCapabilities
          callback({rtpCapabilities})
        })
        
        socket.on('joinRoom', async ({ roomName }, callback) => {
          const router1 = await createRoom(roomName, socket.id)
          console.log("roomName:",roomName);
          peers[socket.id] = {
            socket,
            roomName,           // Room Name or Router Name
            transports: [],
            producers: [],
            consumers: [],
            peerDetails: {
              name: '',         // Name
              isAdmin: false,   // isAdmin?
            }
          }
          const rtpCapabilities = router1.rtpCapabilities
          callback({ rtpCapabilities })
        })

        const createRoom = async (roomName, socketId) => {
          let router1
          let peers = []
          //check if room there already
          if (rooms[roomName]) {
            router1 = rooms[roomName].router
            peers = rooms[roomName].peers || []
          } else {
            router1 = await worker.createRouter({ mediaCodecs, })
            socket.emit('room-start',(roomName));
          }
          
          console.log(`Router ID: ${router1.id}`, peers.length)
          
          rooms[roomName] = {
            router: router1,
            peers: [...peers, socketId],
          }
          
          return router1
        }
        socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
          // get Room Name from Peer's properties
          const roomName = peers[socket.id].roomName
          
          // get Router object by RoomName
          const router = rooms[roomName].router
          
          
          createWebRtcTransport(router).then(
            transport => {
              callback({
                params: {
                  id: transport.id,
                  iceParameters: transport.iceParameters,
                  iceCandidates: transport.iceCandidates,
                  dtlsParameters: transport.dtlsParameters,
                }
              })
              
              // add transport to Peer's properties
              addTransport(transport, roomName, consumer)
            },
            error => {
              console.log(error)
            })
        })
        
        const addTransport = (transport, roomName, consumer) => {
          
          transports = [
            ...transports,
            { socketId: socket.id, transport, roomName, consumer, }
          ]
      
          peers[socket.id] = {
            ...peers[socket.id],
            transports: [
              ...peers[socket.id].transports,
              transport.id,
            ]
          }
        }
        
        const addProducer = (producer, roomName) => {
          producers = [
            ...producers,
            { socketId: socket.id, producer, roomName, }
          ]
      
          peers[socket.id] = {
            ...peers[socket.id],
            producers: [
              ...peers[socket.id].producers,
              producer.id,
            ]
          }
        }
        
        const addConsumer = (consumer, roomName) => {
          consumers = [
            ...consumers,
            { socketId: socket.id, consumer, roomName, }
          ]
          
          peers[socket.id] = {
            ...peers[socket.id],
            consumers: [
              ...peers[socket.id].consumers,
              consumer.id,
            ]
          }
        }
        
        socket.on('getProducers', callback => {
          const { roomName } = peers[socket.id]
          
          let producerList = []
          producers.forEach(producerData => {
            if (producerData.socketId !== socket.id && producerData.roomName === roomName) {
              producerList = [...producerList, producerData.producer.id]
            }
          })
          
          // return all producer
          callback(producerList)
        })
        
        const informConsumers = (roomName, socketId, id) => {
          console.log(`just joined, id ${id} ${roomName}, ${socketId}`)
          
          producers.forEach(producerData => {
            if (producerData.socketId !== socketId && producerData.roomName === roomName) {
              const producerSocket = peers[producerData.socketId].socket
              // use socket to send producer id to producer
              producerSocket.emit('new-producer', { producerId: id })
            }
          })
        }
        
        const getTransport = (socketId) => {
          const [producerTransport] = transports.filter(transport => transport.socketId === socketId && !transport.consumer)
          return producerTransport.transport
        }
        
        // see client's socket.emit('transport-connect', ...)
        socket.on('transport-connect', ({ dtlsParameters }) => {
          //console.log('DTLS PARAMS... ', { dtlsParameters })
          
          getTransport(socket.id).connect({ dtlsParameters })
        })
        
        // see client's socket.emit('transport-produce', ...)
        socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
          
          const producer = await getTransport(socket.id).produce({
            kind,
            rtpParameters,
          })
          
          
          const { roomName } = peers[socket.id]
          
          addProducer(producer, roomName)
          
          informConsumers(roomName, socket.id, producer.id)
          
          console.log('Producer ID: ', producer.id, producer.kind)
          
          producer.on('transportclose', () => {
            console.log('transport for this producer closed ')
            producer.close()
          })
          
          // Send back to the client the Producer's id
          callback({
            id: producer.id,
            producersExist: producers.length>1 ? true : false
          })
        })
        
        // see client's socket.emit('transport-recv-connect', ...)
        socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
          console.log(`DTLS PARAMS: ${JSON.stringify(dtlsParameters)}`)
          const consumerTransport = transports.find(transportData => (
            transportData.consumer && transportData.transport.id == serverConsumerTransportId
            )).transport
            await consumerTransport.connect({ dtlsParameters })
          })
          
          socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
            try {
              
              const { roomName } = peers[socket.id]
              const router = rooms[roomName].router
              let consumerTransport = transports.find(transportData => (
                transportData.consumer && transportData.transport.id == serverConsumerTransportId
                )).transport
                
                // check if the router can consume the specified producer
                if (router.canConsume({
                  producerId: remoteProducerId,
                  rtpCapabilities
                })) {
                  // transport can now consume and return a consumer
                  const consumer = await consumerTransport.consume({
                    producerId: remoteProducerId,
                    rtpCapabilities,
                    paused: true,
                  })
                  
                  consumer.on('transportclose', () => {
                    console.log('transport close from consumer')
                  })
                  
                  
                  consumer.on('producerclose', () => {
                    console.log('producer of consumer closed')
                    console.log("rid:",remoteProducerId);
                    socket.emit('producer-closed', { remoteProducerId })
                    consumerTransport.close([])
                    transports = transports.filter(transportData => transportData.transport.id !== consumerTransport.id)
                    consumer.close()
                    consumers = consumers.filter(consumerData => consumerData.consumer.id !== consumer.id)
                  })
                  
                  addConsumer(consumer, roomName)
                  producerTransportMap[remoteProducerId] = consumerTransport.id;

                  const params = {
                    id: consumer.id,
                    producerId: remoteProducerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    serverConsumerId: consumer.id,
                  }
              
                  // send the parameters to the client
                  callback({ params })
                }
          } catch (error) {
            console.log(error.message)
            callback({
              params: {
                error: error
              }
            })
          }
        })        
        socket.on('consumer-resume', async ({ serverConsumerId }) => {
          console.log('consumer resume')
          const { consumer } = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId)
          await consumer.resume()
        })
        
        socket.on('get-transport',callback =>{
          let transportIdList = [];
          transports.forEach(transportData => {
              transportIdList = [...transportIdList, transportData.transport.internal.transportId];
          })
          callback(transportIdList);
        });
        
        
      })
      
      
      const createWebRtcTransport = async (router) => {
        return new Promise(async (resolve, reject) => {
          try {
            const webRtcTransport_options = {
              listenInfos: [
                {
                  protocol : 'udp',
                  ip       : '0.0.0.0',
                  announcedIp:'127.0.0.1', //Server Public IP
                },
                {
                  protocol : 'tcp',
                  ip       : '0.0.0.0',
                  announcedIp:'127.0.0.1',
                }
          
              ],
            }
            let transport = await router.createWebRtcTransport(webRtcTransport_options)
            console.log(`transport id: ${transport.id}`)
      
            transport.on('dtlsstatechange', dtlsState => {
              if (dtlsState === 'closed') {
                transport.close()
              }
            })
      
            transport.on('close', () => {
              console.log('transport closed')
            })
      
            resolve(transport)
      
          } catch (error) {
            reject(error)
          }
        })};
    });
    
    export default WebSocket;
