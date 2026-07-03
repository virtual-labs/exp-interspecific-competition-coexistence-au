const Chart=(()=>{function draw(cv,series,opts={}){const dpr=window.devicePixelRatio||1;const cssW=cv.clientWidth||cv.width,cssH=cssW*(opts.ratio||0.56);cv.width=cssW*dpr;cv.height=cssH*dpr;const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const W=cssW,H=cssH,m={l:60,r:18,t:16,b:44};g.clearRect(0,0,W,H);let xs=[],ys=[];series.forEach(s=>s.data.forEach(p=>{xs.push(p[0]);ys.push(p[1]);}));if(!xs.length){g.fillStyle='#9aa3b2';g.font='15px Segoe UI';g.textAlign='center';g.fillText('Press "Run" to see results',W/2,H/2);cv._series=null;return;}let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(0,...ys),ymax=Math.max(...ys);if(opts.xmin!=null)xmin=opts.xmin;if(opts.ymin!=null)ymin=opts.ymin;if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;ymax+=(ymax-ymin)*0.08;const X=x=>m.l+(x-xmin)/(xmax-xmin)*(W-m.l-m.r);const Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);g.font='12px Segoe UI';const nT=6;for(let i=0;i<=nT;i++){const gy=ymin+(ymax-ymin)*i/nT;g.strokeStyle='#eef1f6';g.beginPath();g.moveTo(m.l,Y(gy));g.lineTo(W-m.r,Y(gy));g.stroke();g.fillStyle='#7b8494';g.textAlign='right';g.textBaseline='middle';g.fillText(fmt(gy),m.l-8,Y(gy));}for(let i=0;i<=nT;i++){const gx=xmin+(xmax-xmin)*i/nT;g.strokeStyle='#f4f6fa';g.beginPath();g.moveTo(X(gx),m.t);g.lineTo(X(gx),H-m.b);g.stroke();g.fillStyle='#7b8494';g.textAlign='center';g.textBaseline='top';g.fillText(fmt(gx),X(gx),H-m.b+6);}g.strokeStyle='#c7ccd6';g.beginPath();g.moveTo(m.l,m.t);g.lineTo(m.l,H-m.b);g.lineTo(W-m.r,H-m.b);g.stroke();g.fillStyle='#4a5261';g.font='13px Segoe UI';if(opts.xlabel){g.textAlign='center';g.fillText(opts.xlabel,(m.l+W-m.r)/2,H-10);}if(opts.ylabel){g.save();g.translate(15,(m.t+H-m.b)/2);g.rotate(-Math.PI/2);g.textAlign='center';g.fillText(opts.ylabel,0,0);g.restore();}series.forEach(s=>{if(!s.data.length)return;g.strokeStyle=s.color;g.lineWidth=2.4;g.beginPath();s.data.forEach((p,i)=>{const px=X(p[0]),py=Y(p[1]);i?g.lineTo(px,py):g.moveTo(px,py);});g.stroke();if(s.mark){const p=s.data[s.data.length-1];g.fillStyle=s.color;g.beginPath();g.arc(X(p[0]),Y(p[1]),5,0,7);g.fill();}});cv._series=series;cv._map={xmin,xmax,ymin,ymax,m,W,H};}
function fmt(v){const a=Math.abs(v);if(a>=1000)return(v/1000).toFixed(1)+'k';if(a>0&&a<1)return v.toFixed(2);if(!Number.isInteger(v))return v.toFixed(1);return''+v;}return{draw};})();

let view=0,sim=null,anim=null,frame=0;

document.getElementById('subtabs').addEventListener('click',e=>{const b=e.target.closest('.subtab');if(!b)return;view=+b.dataset.view;document.querySelectorAll('.subtab').forEach(t=>t.classList.toggle('active',t===b));drawChart();});
function g(id){return +document.getElementById(id).value;}
function f1(N1,N2,r,K,th,al){return r*N1*(1-Math.pow(Math.max(N1,0)/K,th)-al*N2/K);}
function integrate(){
  const N1=[g('ip1')],N2=[g('ip2')];const r1=g('r1'),k1=g('k1'),t1=g('t1'),a1=g('a1');
  const r2=g('r2'),k2=g('k2'),t2=g('t2'),a2=g('a2');const n=Math.round(g('ns')),h=g('ss');const T=[0];
  for(let i=0;i<n;i++){
    const A=N1[i],B=N2[i];
    const k1a=f1(A,B,r1,k1,t1,a1),k1b=f1(B,A,r2,k2,t2,a2);
    const k2a=f1(A+.5*h*k1a,B+.5*h*k1b,r1,k1,t1,a1),k2b=f1(B+.5*h*k1b,A+.5*h*k1a,r2,k2,t2,a2);
    const k3a=f1(A+.5*h*k2a,B+.5*h*k2b,r1,k1,t1,a1),k3b=f1(B+.5*h*k2b,A+.5*h*k2a,r2,k2,t2,a2);
    const k4a=f1(A+h*k3a,B+h*k3b,r1,k1,t1,a1),k4b=f1(B+h*k3b,A+h*k3a,r2,k2,t2,a2);
    N1[i+1]=Math.max(0,A+(h/6)*(k1a+2*k2a+2*k3a+k4a));
    N2[i+1]=Math.max(0,B+(h/6)*(k1b+2*k2b+2*k3b+k4b));
    T[i+1]=+( (i+1)*h ).toFixed(3);
  }
  return {N1,N2,T,n};
}
function run(){stopAnim();sim=integrate();frame=sim.n;drawChart();drawField(frame);updateCounts(frame);toast('Model integrated');}
function drawChart(){
  if(!sim){Chart.draw(document.getElementById('chart'),[]);return;}
  if(view===0){
    Chart.draw(document.getElementById('chart'),[
      {color:'#b50246',data:sim.T.map((t,i)=>[t,sim.N1[i]])},
      {color:'#0e7c86',data:sim.T.map((t,i)=>[t,sim.N2[i]])}
    ],{xlabel:'Time',ylabel:'Population density',ymin:0,ratio:0.5});
    document.getElementById('plotTitle').textContent='Population densities over time';
    document.getElementById('legend').innerHTML='<span><i style="background:#b50246"></i>Species 1</span><span><i style="background:#0e7c86"></i>Species 2</span>';
  }else{
    const upto=Math.max(1,frame);
    Chart.draw(document.getElementById('chart'),[
      {color:'#7d0130',data:sim.N1.slice(0,upto+1).map((v,i)=>[v,sim.N2[i]]),mark:true}
    ],{xlabel:'Density of species 1 (N₁)',ylabel:'Density of species 2 (N₂)',ymin:0,xmin:0,ratio:0.5});
    document.getElementById('plotTitle').textContent='Phase plane — trajectory of (N₁, N₂)';
    document.getElementById('legend').innerHTML='<span><i style="background:#7d0130"></i>Trajectory (dot = current state)</span>';
  }
}
/* animated field of individuals */
const POS=[];for(let i=0;i<400;i++)POS.push([Math.random(),Math.random()]);
function drawField(i){
  const cv=document.getElementById('field');const dpr=window.devicePixelRatio||1;const W=cv.clientWidth,Hh=W*0.42;
  cv.width=W*dpr;cv.height=Hh*dpr;const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,Hh);
  if(!sim)return;
  const maxN=Math.max(10,...sim.N1,...sim.N2);const scale=120/maxN;
  const n1=Math.min(200,Math.round(sim.N1[i]*scale)),n2=Math.min(200,Math.round(sim.N2[i]*scale));
  c.font='16px serif';c.textAlign='center';c.textBaseline='middle';
  for(let k=0;k<n1;k++){const p=POS[k];c.fillText('🐀',10+p[0]*(W-20),10+p[1]*(Hh-20));}
  for(let k=0;k<n2;k++){const p=POS[k+200<POS.length?k+200:k];c.fillText('🐍',10+p[0]*(W-20),10+p[1]*(Hh-20));}
}
function updateCounts(i){document.getElementById('c1').textContent=Math.round(sim?sim.N1[i]:0);document.getElementById('c2').textContent=Math.round(sim?sim.N2[i]:0);document.getElementById('tnow').textContent=sim?sim.T[i]:0;}
function play(){
  if(!sim){run();}
  if(anim){stopAnim();return;}
  document.getElementById('playBtn').textContent='Pause ⏸';
  let i=(frame>=sim.n)?0:frame;
  anim=setInterval(()=>{
    if(i>sim.n){stopAnim();return;}
    frame=i;drawField(i);updateCounts(i);if(view===1)drawChart();i++;
  },40);
}
function stopAnim(){if(anim){clearInterval(anim);anim=null;}document.getElementById('playBtn').textContent='Play ▶';}
function step(){if(!sim)run();stopAnim();frame=(frame>=sim.n)?0:frame+1;drawField(frame);updateCounts(frame);if(view===1)drawChart();}
function sync(){document.querySelectorAll('.controls .val').forEach(v=>{const el=document.getElementById(v.id.slice(2));if(el)v.textContent=el.value;});}
const D={ip1:10,r1:0.6,k1:100,t1:1,a1:0.6,ip2:10,r2:0.6,k2:80,t2:1,a2:0.5,ns:300,ss:0.1};
function resetSim(){stopAnim();for(const k in D)document.getElementById(k).value=D[k];sync();sim=null;frame=0;Chart.draw(document.getElementById('chart'),[]);drawField(0);document.getElementById('legend').innerHTML='';updateCounts(0);toast('Simulator reset');}
function downloadPNG(){const cv=document.getElementById('chart');if(!cv._series){toast('Run first');return;}const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);c.drawImage(cv,0,0);const a=document.createElement('a');a.download='coexistence.png';a.href=o.toDataURL();a.click();toast('PNG downloaded');}
function downloadCSV(){if(!sim){toast('Run first');return;}let csv='time,N1,N2\n';for(let i=0;i<=sim.n;i++)csv+=sim.T[i]+','+sim.N1[i]+','+sim.N2[i]+'\n';dl(csv,'coexistence.csv','text/csv');toast('CSV downloaded');}
function saveRun(){const o={};document.querySelectorAll('.controls input').forEach(i=>o[i.id]=i.value);localStorage.setItem('coexistence',JSON.stringify(o));toast('Run saved');}
function loadRun(){const s=localStorage.getItem('coexistence');if(!s){toast('No saved run');return;}const o=JSON.parse(s);for(const k in o){const el=document.getElementById(k);if(el)el.value=o[k];}sync();run();toast('Run loaded');}
function dl(t,n,ty){const b=new Blob([t],{type:ty});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();URL.revokeObjectURL(a.href);}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}


sync();drawField(0);window.addEventListener('resize',()=>{if(sim){drawChart();drawField(frame);}});

/* ---- fullscreen (whole simulation box) ---- */
function toggleFS(){var el=document.getElementById('simbox');var fsEl=document.fullscreenElement||document.webkitFullscreenElement;if(!fsEl){var rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq)rq.call(el);}else{var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex)ex.call(document);}}
function _fsSync(){var b=document.getElementById('fsBtn');var on=document.fullscreenElement||document.webkitFullscreenElement;if(b)b.textContent=on?'✕':'⛶';setTimeout(function(){window.dispatchEvent(new Event('resize'));},70);}
document.addEventListener('fullscreenchange',_fsSync);
document.addEventListener('webkitfullscreenchange',_fsSync);
