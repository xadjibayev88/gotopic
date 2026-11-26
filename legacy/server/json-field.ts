/** Decodes only a complete prefix of a JSON string, including split escapes. */
export function partialString(raw:string,key:'ko'|'uz'): {value:string;complete:boolean} {
 const match=new RegExp('"'+key+'"\\s*:\\s*"').exec(raw);
 if(!match)return {value:'',complete:false};
 let value='';
 for(let i=match.index+match[0].length;i<raw.length;i++){
  const char=raw[i];
  if(char==='"')return {value,complete:true};
  if(char!=='\\'){value+=char;continue;}
  const next=raw[++i];if(!next)break;
  if(next==='u'){
   const hex=raw.slice(i+1,i+5);if(hex.length<4)break;
   if(!/^[a-f0-9]{4}$/i.test(hex))throw new Error('Invalid JSON escape');
   value+=String.fromCharCode(parseInt(hex,16));i+=4;
  } else {
   const escapes:Record<string,string>={'"':'"','\\':'\\','/':'/','n':'\n','r':'\r','t':'\t','b':'\b','f':'\f'};
   if(!(next in escapes))throw new Error('Invalid JSON escape');value+=escapes[next];
  }
 }
 if(value.length&&/^[\uD800-\uDBFF]$/.test(value.slice(-1)))value=value.slice(0,-1);
 return {value,complete:false};
}
