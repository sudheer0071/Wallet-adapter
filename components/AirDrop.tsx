import { walletConnectState } from "@/app/RecoilContextProvider"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useState } from "react"
import { useRecoilState } from "recoil"
import {Toaster , toast} from 'sonner'


export const AirDrop = ()=>{

  const {connection} = useConnection()
  const wallets = useWallet()

  const [amount, setAmount] = useState<number|any>()
  const [walletConnect, SetWalletConnect]  = useRecoilState(walletConnectState)

  if (wallets.publicKey!=null) {
    SetWalletConnect(true)
  }
else{
  SetWalletConnect(false)
}

  const RequestAirDrop = async()=>{
    console.log("amount: ");
    console.log(amount);
    
    
    if (wallets.publicKey!=null) {
      if (!amount) {
        toast.warning("Please enter the amount ")
        return 
      }
      const loadingToastId = toast.loading(`Air Dropping you ${amount} tokens...`);
        try {
            const aridrop = await connection.requestAirdrop(wallets.publicKey,  amount*LAMPORTS_PER_SOL)
            console.log(aridrop);
        
            if (aridrop) {
      toast.dismiss(loadingToastId) 
      toast.success(`${amount} tokens AirDropped to address: ${wallets.publicKey}`)
      setAmount('')
    } else{
                  toast.error(`something went wrong`)
                }
              } catch (error) { 
      toast.dismiss(loadingToastId)

      setAmount('')
      toast.error(`Too many request Try after sometime or try using different wallet`) 
    }
    } 
    else{
      toast.warning("Please connect your wallet first!")
    }
  }
  
  return <div>
    <div className=" hidden md:inline lg:inline ">
        <Toaster richColors  position="bottom-right"/>
        </div>
        <div className=" md:hidden lg:hidden">
        <Toaster richColors position="top-center"/>
        </div>
    <input type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} placeholder="Amount" className=" p-3 bg-slate-800 text-white font-medium text-lg rounded-md" />
    <button onClick={RequestAirDrop} className=" p-3 ml-3 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">AirDrop</button>
  </div>
}