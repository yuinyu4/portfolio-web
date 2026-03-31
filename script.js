function addProject(){
 let list=JSON.parse(localStorage.getItem('projects'))||[];
 list.push({title:title.value,desc:desc.value,tech:tech.value,link:link.value});
 localStorage.setItem('projects',JSON.stringify(list));
 alert('Added');
}

function addPhoto(){
 let photos=JSON.parse(localStorage.getItem('photos'))||[];
 let reader=new FileReader();
 reader.onload=function(){
   photos.push({img:reader.result,date:photoDate.value});
   photos.sort((a,b)=>new Date(b.date)-new Date(a.date));
   localStorage.setItem('photos',JSON.stringify(photos));
   alert('Uploaded');
 };
 reader.readAsDataURL(photoInput.files[0]);
}

function renderProjects(){
 let list=JSON.parse(localStorage.getItem('projects'))||[];
 let el=document.getElementById('projectList');
 if(!el)return;
 el.innerHTML='';
 list.forEach(p=>{
   el.innerHTML+=`<div class="card reveal"><h3>${p.title}</h3><p>${p.desc}</p><small>${p.tech}</small></div>`;
 });
}

function renderPhotos(){
 let photos=JSON.parse(localStorage.getItem('photos'))||[];
 let el=document.getElementById('gallery');
 if(!el)return;
 el.innerHTML='';
 photos.forEach(p=>{
   el.innerHTML+=`<img src="${p.img}" onclick="openModal(this.src)" class="reveal">`;
 });
}

function openModal(src){
 let modal=document.getElementById('modal');
 let img=document.getElementById('modalImg');
 modal.style.display='flex';
 img.src=src;
}

function closeModal(){
 document.getElementById('modal').style.display='none';
}

window.addEventListener("load",()=>{
 document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
});

renderProjects();
renderPhotos();
