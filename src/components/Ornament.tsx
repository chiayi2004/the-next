import { tags } from '../data/tags';
export function Ornament({tag, className=''}:{tag:string;className?:string}) {
  const motif=tags[tag]?.motif;
  return <svg className={className} viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    <circle cx="80" cy="80" r="62" strokeDasharray="1 7"/><path d="M80 5v15M80 140v15M5 80h15M140 80h15M28 28l9 9M123 123l9 9M28 132l9-9M123 37l9-9"/>
    {motif==='moon'?<><path d="M98 38a43 43 0 1 0 21 64 41 41 0 0 1-21-64Z"/><path d="m103 54 3 9 9 3-9 3-3 9-3-9-9-3 9-3ZM55 113l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><circle cx="65" cy="44" r="2"/></>:motif==='flower'?<><path d="M80 127V71M80 98q-30-25-34-9 4 22 34 22M80 109q30-28 35-14-4 24-35 24"/><path d="M80 74C33 76 35 43 63 51 44 17 84 16 80 44c17-36 47-11 24 7 39 1 23 35-6 25-4 22-24 21-18-2Z"/><circle cx="82" cy="62" r="10"/></>:motif==='house'?<><path d="m35 76 45-37 45 37M46 71v48h68V71M69 119V85h22v34M28 126h104M104 55V39h9v24"/><path d="M54 92h8M98 92h8M80 27v-8"/></>:<><circle cx="79" cy="56" r="23"/><circle cx="79" cy="56" r="13"/><path d="M79 79v52h18v-10H86v-10h12v-10H79M60 30l-6-9M101 30l6-9"/></>}
  </svg>;
}
