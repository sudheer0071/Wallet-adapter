
import { useWallet } from "@solana/wallet-adapter-react"
import { Ed25519Program } from "@solana/web3.js"
import { useState } from "react"
import { toast, Toaster } from "sonner"
import bs58 from 'bs58'
import {ed25519} from '@noble/curves/ed25519'
import { useRecoilState } from "recoil"
import { walletConnectState } from "@/app/RecoilContextProvider"

export const SignMessage = ()=>{
  const [message, setMessage] = useState('')
   const [signature, setSignature] = useState<string | any>('')
  const {publicKey, signMessage} = useWallet()

  const [walletConnect, SetWalletConnect]  = useRecoilState(walletConnectState)

  if (publicKey!=null) {
    SetWalletConnect(true)
  }
else{
  SetWalletConnect(false)
}

  const copyclipboard = (text:string)=>{
    window.navigator.clipboard.writeText(text)
    toast.success("copied to clipboard!")
  }

  const sign = async ()=>{
    if (message=='') {
      toast.warning("Please type some message first")
      return;
    }
    const tost = toast.loading('Signing a message...')
    try { 
      if (!publicKey) {
        toast.dismiss(tost)
        toast.error("Wallet not connected!")
   }
   if (!signMessage) {
    toast.dismiss(tost)
    toast.error("Wallet Does not support")
   }
   const encodedMessage = new  TextEncoder().encode(message)
   const signature = signMessage &&  await signMessage(encodedMessage) 
    
   if(signature && publicKey)
   if(!ed25519.verify(signature, encodedMessage, publicKey?.toBytes())){
    toast.dismiss(tost)
    toast.error("Message Signature invalid!")
   }
   
   toast.dismiss(tost)
   toast.success(`Success`)
   const signn = signature && bs58.encode(signature)
   setSignature(signn)
   setMessage('')
  } catch (error) {
    toast.dismiss(tost)
    toast.error(`Something went wrong`)
  }
  }

  return <div>
    <Toaster richColors/>
    <div className=" flex justify-center w-full px-2">
   <input type="text" value={message} onChange={(e:any)=>setMessage(e.target.value)} placeholder="Enter Reciever's Address" className=" w-full truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md" />
    </div>
   <div className=" flex justify-center">
     <button onClick={sign} className=" p-3 mt-3 px-4 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">Sing a Message</button>
</div>

{
  signature && 
<div>
  
<div className=" text-xl text-left font-medium">
  Signature:
</div>
<div className=" mt-2">
  <div onClick={()=>copyclipboard(signature)} className=" transition-all duration-500 text-sm bg-purple-300 hover:font-medium cursor-pointer rounded-md text-black p-1 truncate">{signature}</div>
</div>
</div>
}
  </div>
}