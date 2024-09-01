import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"

export const SolBalance = ({top}:{top:boolean})=>{

  const [balance, setBalnace] = useState<number|null>(0)

  const wallet = useWallet()
  const {connection} = useConnection()
  useEffect(()=>{
    checkBalance()
  },[])
  
  const checkBalance = async()=>{
    const bal = wallet.publicKey && await connection.getBalance(wallet.publicKey)
    setBalnace( bal&& bal / LAMPORTS_PER_SOL)
  }
  return <div className={` ${top?'':'bg-gradient-to-r rounded-md from-purple-200 to-teal-600 p-3'}  flex justify-center items-center`}>
     <div className="">
      <img width={50} className=" rounded-full" src="https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fsolana-labs%2Ftoken-list%40main%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png&fit=cover&width=160&height=160" alt="" />
     </div>
     <div className=" ml-4">
       <div className=" text-3xl font-medium">
        Solana
       </div>
       <div className=" font-medium">
        {balance?.toFixed(6)} sol
       </div>
     </div>
  </div>
}