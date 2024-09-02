"use client"

import React, { ReactNode, useEffect } from 'react';
import { RecoilRoot, atom, useSetRecoilState} from 'recoil';   
 
 

export const sendState = atom<boolean>({
  key:'send',
  default:false, 
})

export const walletConnectState = atom<boolean>({
  key:'walletConnet',
  default:false, 
})

export default function RecoilContextProvider({ children }:{children:ReactNode}){
  return <RecoilRoot>{children}</RecoilRoot>
}
 