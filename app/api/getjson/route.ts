import { NextApiRequest, NextApiResponse } from "next"; 
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest, res:NextResponse){
  
  type RequestBody = {
    name:string,
    symbol:string,
    description:string,
    image:string
  }
  console.log("res from another file");
  
console.log(res);

  console.log("inside the api: ");
  const  body   = await req.json();
  // console.log(body);
  console.log("data");
  
  console.log(body.data);
  // console.log(filename);
  
  const jsonString = JSON.stringify(body.data, null, 2);
  // res.setHeader('Content-Type', 'application/json');
  // res.setHeader('Content-Disposition', `attachment; ${filename}`);
  return Response.json(jsonString)
}