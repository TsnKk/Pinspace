import {chromium} from 'file:///C:/Users/Tanachai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.registeredTools={};document.modelContext={registerTool(tool,options){window.registeredTools[tool.name]=tool;options?.signal.addEventListener('abort',()=>delete window.registeredTools[tool.name])}}});
await page.goto('http://127.0.0.1:5173/signin-with-chatgpt?return_to=/');await page.getByRole('button',{name:'สร้างแคนวาสใหม่',exact:true}).waitFor();
await page.getByRole('button',{name:'สร้างแคนวาสใหม่',exact:true}).click();await page.getByLabel('ชื่อแคนวาส',{exact:true}).fill('บอร์ดไอเดียของฉัน');await page.getByRole('button',{name:'สร้างแคนวาส',exact:true}).click();await page.getByRole('heading',{name:'บอร์ดไอเดียของฉัน',exact:false}).waitFor();
await page.screenshot({path:'C:/Users/Tanachai/Projects/pinspace/outputs/desktop-empty.png'});
await page.getByRole('button',{name:'เพิ่มโน้ต',exact:true}).click();await page.getByLabel('ชื่อโน้ต',{exact:true}).fill('แนวทางของโปรเจกต์');await page.getByLabel('รายละเอียด / สิ่งที่ชอบในรูปนี้').fill('รวบรวมรูปที่ชอบ แล้วค่อยกลับมาจัดกลุ่มไอเดีย');await page.getByLabel('แท็ก',{exact:true}).fill('ไอเดีย, โปรเจกต์');await page.getByRole('button',{name:'บันทึกรายละเอียด',exact:true}).click();await page.getByRole('heading',{name:'แนวทางของโปรเจกต์',exact:true}).waitFor();
const drag=page.getByRole('button',{name:'เปิดหรือลาก แนวทางของโปรเจกต์',exact:true});const box=await drag.boundingBox();await page.mouse.move(box.x+60,box.y+15);await page.mouse.down();await page.mouse.move(box.x+260,box.y+160,{steps:12});await page.mouse.up();await page.getByRole('status').filter({hasText:'บันทึกแล้ว'}).first().waitFor();
const before=await page.locator('.note-card').last().getAttribute('style');await page.reload();await page.getByRole('button',{name:'บอร์ดไอเดียของฉัน',exact:false}).last().click();await page.getByRole('heading',{name:'แนวทางของโปรเจกต์',exact:true}).waitFor();const after=await page.locator('.note-card').last().getAttribute('style');assert.ok(before.includes('236px'));assert.ok(after.includes('236px'));
await page.locator('input[type=file]').setInputFiles({name:'ทดสอบรูป.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});await page.getByRole('heading',{name:'ทดสอบรูป',exact:true}).waitFor();
await page.getByRole('button',{name:'แก้ไข ทดสอบรูป',exact:true}).click();await page.getByLabel('ชื่อรูปภาพ',{exact:true}).fill('รูปสำหรับอ้างอิง');await page.getByLabel('แหล่งอ้างอิง',{exact:true}).fill('https://example.com');await page.getByRole('button',{name:'บันทึกรายละเอียด',exact:true}).click();await page.getByRole('heading',{name:'รูปสำหรับอ้างอิง',exact:true}).waitFor();
await page.screenshot({path:'C:/Users/Tanachai/Projects/pinspace/outputs/desktop-cards.png'});
const tools=await page.evaluate(()=>Object.keys(window.registeredTools));assert.ok(tools.includes('create_canvas'));assert.ok(tools.includes('list_canvases'));
const read=await page.evaluate(()=>window.registeredTools.list_canvases.execute({}));assert.ok(read.boards.length>=1);
const invalid=await page.evaluate(async()=>{try{await window.registeredTools.create_canvas.execute({name:''});return false}catch{return true}});assert.ok(invalid);
await page.evaluate(()=>window.registeredTools.create_canvas.execute({name:'WebMCP test'}));await page.getByRole('heading',{name:'WebMCP test',exact:false}).waitFor();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'C:/Users/Tanachai/Projects/pinspace/outputs/mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
assert.deepEqual(errors,[]);console.log('PASS: create canvas, edit notes, drag and reload persistence, upload UI, image details, responsive layout, WebMCP registration/valid/invalid input.');await browser.close();



