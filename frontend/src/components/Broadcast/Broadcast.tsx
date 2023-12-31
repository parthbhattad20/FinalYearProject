import { Button } from '../ui/button'
import { GrNewWindow } from "react-icons/gr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAuth } from '@/context/AuthContext';



function Broadcast() {
  const auth = useAuth();
  console.log(auth);

  return (
    <div className='p-6'>
        <h2 className='text-3xl font-semibold tracking-tight'>Create a Broadcast</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={'secondary'} className='my-4'>
                <GrNewWindow className='mr-2'/> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='text-xl'>Set destinations</DialogTitle>
            </DialogHeader>
            <ToggleGroup className='justify-start gap-2' type="multiple">
              <ToggleGroupItem className='h-14' variant='outline' size='lg' value="youtube">
                <img className='w-8 h-8' src="https://www.ohmystream.co/static/media/youtube.bdc1f583e488e2e672cff695a1c379d1.svg" alt="Youtube logo" />
              </ToggleGroupItem>
              <ToggleGroupItem className='h-14' variant='outline' size='lg' value="twitch">
                <img className='w-8 h-8' src="https://www.ohmystream.co/static/media/twitch.ad8ab2f2e67d7ee904a135ed5bcd2c1f.svg" alt="Twitch logo" />
              </ToggleGroupItem>
              <ToggleGroupItem className='h-14' variant='outline' size='lg' value="facebook">
                <img className='w-8 h-8' src="https://www.ohmystream.co/static/media/facebook.c3402e464658a657669832c282de64a7.svg" alt="Facebook logo" />
              </ToggleGroupItem>
            </ToggleGroup>
          </DialogContent>
        </Dialog>

    </div>
  )
}

export default Broadcast