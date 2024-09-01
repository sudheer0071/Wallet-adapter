"use client"

import { SpotlightPreview } from "@/components/SpotlightBackground";
import {ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {LucideRefreshCcw, RefreshCcw} from 'lucide-react'

import {     WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton, } from '@solana/wallet-adapter-react-ui'

import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useMemo } from "react";

import '@solana/wallet-adapter-react-ui/styles.css'
import { AirDrop } from "@/components/AirDrop";
import { SolBalance } from "@/components/SolBalance";
import { SendTokens } from "@/components/SendTokens";
import { SignMessage } from "@/components/SignMessage";
import { useRecoilState } from "recoil";
import { sendState } from "./RecoilContextProvider";
import { toast } from "sonner";

export default function Home() {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(()=> clusterApiUrl(network),[network])
  const [send, setSend] = useRecoilState(sendState)

  return (
         <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={[]} autoConnect >
          <WalletModalProvider>
  <div className=" absolute right-2 flex justify-end p-3 ">
    <div className=" bg-gradient-to-r from-teal-200 to-purple-700 p-3 rounded-md">
  <SolBalance top={true}/>
    </div>
  </div>
 <div className="home h-screen bg-slate-900">
    <SpotlightPreview/>
    <div className="  pt-10">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Best Wallet adapter  <br /> you gonna use
        </h1>
        <div className=" mt-10">
        <div className=" flex justify-center gap-16">
            <WalletMultiButton/>
            <WalletDisconnectButton/>
        </div> 
<div className=" flex justify-center mt-20 ">
        <Tabs defaultValue="account" className=" max-w-2xl w-full px-10 flex justify-center flex-col">
  <TabsList className=" bg-black flex gap-10">
    <TabsTrigger value="AirDrop">
      <div>
        AirDrop
      </div>
    </TabsTrigger>
    <TabsTrigger value="sendSol">Send sol</TabsTrigger>
    <TabsTrigger value="checkSol">Check sol</TabsTrigger>
    <TabsTrigger value="signature">Sign a Message</TabsTrigger>
  </TabsList>
  <TabsContent value="AirDrop"><div>
    <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md">
      <div className=" text-2xl font-semibold text-center">
    AirDrop some tokens
      </div>
    <div className=" mt-8 flex justify-center ">
      <AirDrop/>
    </div>
    </div>
    </div></TabsContent>
  <TabsContent value="sendSol">
  <div>
  <div className=" bg-custom-gradient p-3 py-10 rounded-b-md">
      <div className=" text-2xl font-semibold text-center">
    Send Some sols another address
      </div>
    <div className=" mt-8 flex justify-center ">
      <SendTokens/>
    </div>
    </div>
    </div>
  </TabsContent>
  <TabsContent value="checkSol">
  <div>
  <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md relative">
      <div className=" text-3xl font-semibold text-center">
      Check your Sol
      </div>
    <div className=" mt-8 flex justify-center ">
      <SolBalance top={false} />
    </div>
    <RefreshCcw onClick={()=>{ 
      setSend(true); 
    }} className=" cursor-pointer hover:scale-110 transition-all duration-500 absolute left-3 top-2"/>
    </div>
    </div>
  </TabsContent>
  <TabsContent value="signature">
  <div>
  <div className=" bg-custom-gradient  p-3 py-10 rounded-b-md relative">
      <div className=" text-3xl font-semibold text-center">
      Type your message to be signed
      </div>
    <div className=" mt-8  ">
      <SignMessage/>
    </div> 
    </div>
    </div>
  </TabsContent>
</Tabs>
</div>  
        </div>
             <div>

             </div>
      </div>
 </div>
          </WalletModalProvider>
          </WalletProvider>
         </ConnectionProvider>
  );
}
