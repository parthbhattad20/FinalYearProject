import Login from '@/components/Login/Login'
import Register from '@/components/Register/Register'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Auth() {
  return (
    <div className='flex h-screen'>
      <div className='w-1/2'>
        <img className='object-cover w-full h-full' src="https://images.unsplash.com/photo-1679669693237-74d556d6b5ba?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="placeholder 3d render image" />
      </div>
      <div className='w-1/2 grid place-content-center'>
        <Tabs defaultValue="signup" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create your StreamSync account and get started with livestreaming.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Register/>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Head toward your dashboard by entering your login credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Login/>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Auth