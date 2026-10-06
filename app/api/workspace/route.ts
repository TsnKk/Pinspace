import { getChatGPTUser } from "@/app/chatgpt-auth";
import { db, bucket } from "@/db/raw";
export const dynamic="force-dynamic";
class ApiError extends Error { constructor(message:string,public status=400){super(message)} }
function str(v:unknown,max:number,required=false){if(typeof v!=="string"||v.length>max||(required&&!v.trim()))throw new ApiError("ข้อมูลไม่ถูกต้องหรือยาวเกินไป");return v.trim();}
function num(v:unknown){if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>20000)throw new ApiError("ตำแหน่งไม่ถูกต้อง");return Math.round(v);}
async function user(){const u=await getChatGPTUser();if(!u)throw new ApiError("กรุณาเข้าสู่ระบบเพื่อเปิดแคนวาส",401);return u.userId;}
function output(row:Record<string,unknown>){return {...row,tags:JSON.parse(String(row.tags||"[]")),image:row.image_key?"/api/images/"+row.id:null};}
function fail(e:unknown){if(e instanceof ApiError)return Response.json({error:e.message},{status:e.status});console.error("Workspace storage error",e);return Response.json({error:"บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง ข้อมูลที่กรอกยังอยู่"},{status:503});}
export async function GET(){try{const owner=await user();const [b,c]=await Promise.all([db().prepare("SELECT id, name, created FROM boards WHERE owner = ? ORDER BY created").bind(owner).all(),db().prepare("SELECT * FROM cards WHERE owner = ? ORDER BY created").bind(owner).all()]);return Response.json({boards:b.results,cards:c.results.map(output)},{headers:{"Cache-Control":"no-store"}})}catch(e){return fail(e)}}
export async function POST(req:Request){try{
 const owner=await user();const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)throw new ApiError("ไม่อนุญาตคำขอจากเว็บไซต์อื่น",403);
 if(req.headers.get("content-type")?.includes("multipart/form-data")){
 if(Number(req.headers.get("content-length")||0)>11*1024*1024)throw new ApiError("รูปต้องมีขนาดไม่เกิน 10 MB");
 const form=await req.formData();const boardId=str(form.get("boardId"),100,true);const board=await db().prepare("SELECT id FROM boards WHERE id=? AND owner=?").bind(boardId,owner).first();if(!board)throw new ApiError("ไม่พบแคนวาส",404);
 const file=form.get("file");if(!(file instanceof File)||file.size===0||file.size>10*1024*1024)throw new ApiError("เลือกรูปขนาดไม่เกิน 10 MB");
 const a=new Uint8Array(await file.arrayBuffer());let mime="";
 if(a[0]===255&&a[1]===216&&a[2]===255)mime="image/jpeg";
 else if(a[0]===137&&a[1]===80&&a[2]===78&&a[3]===71)mime="image/png";
 else if(String.fromCharCode(...a.slice(0,6)).match(/^GIF8[79]a$/))mime="image/gif";
 else if(String.fromCharCode(...a.slice(0,4))==="RIFF"&&String.fromCharCode(...a.slice(8,12))==="WEBP")mime="image/webp";
 if(!mime)throw new ApiError("รองรับเฉพาะรูป JPG, PNG, WebP และ GIF");
 const id=crypto.randomUUID(),key="images/"+id;const title=file.name.replace(/\.[^.]+$/,"").slice(0,120)||"รูปภาพใหม่";const x=num(Number(form.get("x")||40)),y=num(Number(form.get("y")||40));
 await bucket().put(key,a,{httpMetadata:{contentType:mime}});
 try{await db().prepare("INSERT INTO cards (id,board_id,owner,kind,image_key,title,x,y,created) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,boardId,owner,"image",key,title,x,y,Date.now()).run()}catch(e){await bucket().delete(key);throw e}
 const row=await db().prepare("SELECT * FROM cards WHERE id=?").bind(id).first();return Response.json({card:output(row!)});
 }
 const b=await req.json() as Record<string,unknown>;
 if(b.action==="createBoard"){const name=str(b.name,100,true),id=crypto.randomUUID(),created=Date.now();await db().prepare("INSERT INTO boards (id,owner,name,created) VALUES (?,?,?,?)").bind(id,owner,name,created).run();return Response.json({board:{id,name,created}})}
 const id=str(b.id,100,true);
 if(b.action==="renameBoard"){const name=str(b.name,100,true);const r=await db().prepare("UPDATE boards SET name=? WHERE id=? AND owner=?").bind(name,id,owner).run();if(!r.meta.changes)throw new ApiError("ไม่พบแคนวาส",404);return Response.json({ok:true})}
 if(b.action==="createNote"){const board=await db().prepare("SELECT id FROM boards WHERE id=? AND owner=?").bind(id,owner).first();if(!board)throw new ApiError("ไม่พบแคนวาส",404);const cid=crypto.randomUUID();await db().prepare("INSERT INTO cards (id,board_id,owner,kind,title,x,y,created) VALUES (?,?,?,?,?,?,?,?)").bind(cid,id,owner,"note","โน้ตใหม่",num(b.x??40),num(b.y??40),Date.now()).run();const row=await db().prepare("SELECT * FROM cards WHERE id=?").bind(cid).first();return Response.json({card:output(row!)})}
 const card=await db().prepare("SELECT * FROM cards WHERE id=? AND owner=?").bind(id,owner).first();if(!card)throw new ApiError("ไม่พบการ์ดนี้",404);
 if(b.action==="moveCard"){await db().prepare("UPDATE cards SET x=?,y=? WHERE id=? AND owner=?").bind(num(b.x),num(b.y),id,owner).run();return Response.json({ok:true})}
 if(b.action==="updateCard"){
 const title=str(b.title,120,true),description=str(b.description,10000),reference=str(b.reference,2000);
 if(!Array.isArray(b.tags)||b.tags.length>20)throw new ApiError("เพิ่มได้ไม่เกิน 20 แท็ก");const tags=[...new Set(b.tags.map(t=>str(t,40,true)))];
 await db().prepare("UPDATE cards SET title=?,description=?,reference=?,tags=? WHERE id=? AND owner=?").bind(title,description,reference,JSON.stringify(tags),id,owner).run();return Response.json({ok:true});
 }
 if(b.action==="deleteCard"){await db().prepare("DELETE FROM cards WHERE id=? AND owner=?").bind(id,owner).run();if(card.image_key){try{await bucket().delete(String(card.image_key))}catch(e){console.error("Orphan image cleanup failed",e)}}return Response.json({ok:true})}
 throw new ApiError("ไม่รู้จักคำสั่งนี้");
 }catch(e){return fail(e)}
}
