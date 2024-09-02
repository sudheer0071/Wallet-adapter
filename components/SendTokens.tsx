import { walletConnectState } from "@/app/RecoilContextProvider";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react"
import { useRecoilState } from "recoil";
import { toast, Toaster } from "sonner";

export const SendTokens = ()=>{

  const [amount, setAmount] = useState<number | any>();
  const [to, setTo] = useState('')
  const wallet = useWallet()
  const {connection} =  useConnection()
  
  const [walletConnect, SetWalletConnect]  = useRecoilState(walletConnectState)

  if (wallet.publicKey!=null) {
    SetWalletConnect(true)
  }
else{
  SetWalletConnect(false)
}

  const sendTransaction = async ()=>{
    if(wallet.publicKey!=null) {
      if (amount==''||to=='') {
        toast.warning("Please enter all Feilds first.")
        return
      }
      const idd = toast.loading('Initiating transaction...')
      try {
        const transaction = new Transaction();
        wallet.publicKey &&  transaction.add(SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount && amount * LAMPORTS_PER_SOL
      }))
  
      await wallet.sendTransaction(transaction, connection)
      toast.dismiss(idd)
      toast.success('Transaction complete !')
      setAmount('');
      setTo('')
    } catch (error) {
      toast.dismiss(idd)
      toast.error('Something went wrong :/')
    }
    }
    else {
      toast.warning("Please Connect your Wallet first. ")
    }
  }
  
  return <div>
    <Toaster richColors />
      <label htmlFor="To" className=" font-semibold text-xl">To</label>
      <div className="">
       <input type="text" value={to} onChange={(e:any)=>setTo(e.target.value)} placeholder="Enter Reciever's Address" className=" truncate p-3 bg-slate-800 text-white font-medium text-lg rounded-md" />
      </div>
      <div className=" mt-6">
       <input type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} placeholder="Amount to be send" className=" p-3 bg-slate-800 text-white font-medium text-lg rounded-md" />
      </div>
<div className=" flex justify-center">
     <button onClick={sendTransaction} className=" p-3 mt-3 px-4 bg-teal-500 rounded-md hover:bg-teal-800 hover:text-white transition-all duration-500">send</button>
</div>
  </div>
}