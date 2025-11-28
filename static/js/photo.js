const html = {
    get(element){
        return document.querySelector(element)
    }
}

var imagesList = [];
var totalItems = imgJSON.length;
var imgPerPage = 12;
var totalPage = Math.ceil(totalItems / imgPerPage);
var state = {
    page: 1,
    imgPerPage,
    totalPage,
    maxVisibleButtons: 5,
    currentTheaterImageId: ""
};

var htmlbody = html.get("body");
var imgGrid = html.get("#imgGrid");
var theaterImage = html.get("#theaterImg")
var title = html.get("#imgInfoTitle")
var body = html.get("#imgInfoBody")
var theaterContainer = html.get("#theater")
var imageContainer = html.get("#imageContainer")
var imgInfo = html.get("#imgInfo")
var mapC = html.get("#map")
var mapContainer = html.get("#mapContainer")


let url = new URL(window.location.href)

function getImages(maxImages=1) {
    imagesList = imgJSON;
    list.update();
};

function setParams(name, data) {
    switch (name) {
        case "page":
            url.searchParams.set('page', state.page);
            window.history.pushState(state, '', url.toString());
            break;
        case "photo":
            const imageIndex = data;
            url.searchParams.set('photo', imagesList[imageIndex].id);
            window.history.pushState(state, '', url.toString());
            break;
    }
}

function deleteParam(name) {
    url.searchParams.delete(name);
    window.history.pushState(state, '', url.toString());
}

const pageControls = {
    next(){
        state.page++;
        if(state.page > state.totalPage){
            state.page--;
        }
        setParams('page')
    },
    prev(){
        state.page--;
        if(state.page < 1){
            state.page++;
        }
        setParams('page')
    },
    goTo(page){
        if(page < 1){
            page = 1;
        }
        state.page = parseInt(page);
        if(page > state.totalPage){
            state.page = parseInt(state.totalPage);
        }
        setParams('page')
    },
    createListeners(){
        html.get('.first').addEventListener("click", ()=>{
            pageControls.goTo(1);
            update();
        })
        html.get('.last').addEventListener("click", ()=>{
            pageControls.goTo(state.totalPage);
            update();
        })
        html.get('.next').addEventListener("click", ()=>{
            pageControls.next();
            update();
        })
        html.get('.prev').addEventListener("click", ()=>{
            pageControls.prev();
            update();
        })
    }
}

const viewControls = {
    openMap(){
        console.log("map opened ;p")
        openMapView();


    },
    closeMap() {
        // closeMapView();
    },
    createListeners(){
        html.get('.map-button').addEventListener("click", ()=>{
            viewControls.openMap();
            update();
        })
        html.get('#map').addEventListener("click", ()=>{
            viewControls.closeMap();
            update();
        })
    }

}

function openMapView(img) {


    // show the map
    mapC.style.display = "flex";
    mapContainer.style.height = "500px";
    mapContainer.style.width = "500px";

    // prevent body from scrolling when theater is open
    htmlbody.setAttribute("class", "modal-open")
    return null;
}

function closeMapView() {
    mapContainer.style.display = "none"
    htmlbody.removeAttribute("class")

    return null;
}


const theaterControls = {
    next(){
        let nextImageIndex = imagesList.map(function(obj) {return obj.id}).indexOf(state.currentTheaterImageId) + 1;

        if (nextImageIndex < totalItems) {
            openTheaterMode(imagesList[nextImageIndex])
            setParams('photo', nextImageIndex)
        }
    },
    prev(){
        let prevImageIndex = imagesList.map(function(obj) {return obj.id}).indexOf(state.currentTheaterImageId) - 1;

        if (prevImageIndex >= 0) {
            openTheaterMode(imagesList[prevImageIndex])
            setParams('photo', prevImageIndex)
        }
    },
    createListeners(){
        html.get('.theater-control-right').addEventListener("click", (e)=>{
            e.stopPropagation();
            theaterControls.next();
            update();
        })
        html.get('.theater-control-left').addEventListener("click", (e)=>{
            e.stopPropagation();
            theaterControls.prev();
            update();
        })
    }
}

const list = {
    create(images){
        images.forEach((value, index) =>{
            var imgDiv = document.createElement("div");
            var image = document.createElement("img");

            imgDiv.onclick = function() { openTheaterMode(value); };
            image.setAttribute("src", value.path);
            //imgDiv.style.backgroundColor = img.bgColor;
            imgDiv.setAttribute("loading", "lazy")
            imgDiv.setAttribute("alt", "image item")
        
            imgDiv.append(image);
            imgGrid.append(imgDiv);
        });
    },
    update(){
        html.get(".img-grid").innerHTML = "";
        let page = state.page - 1;
        
        let start = page * state.imgPerPage;
        let end = start + state.imgPerPage;
        
        const paginatedItems = imagesList.slice(start, end);
        list.create(paginatedItems);
      
    }
  }
  
const buttons = {
    create(number){
        const button = document.createElement('div');
        button.innerHTML =  number;
        if(state.page == number) button.classList.add('current');
        
        button.addEventListener("click", (event)=>{
            const page = event.target.innerText;
            pageControls.goTo(+page);
            update();
        })
        html.get(".pagination .numbers").appendChild(button);
    },
    update(){
        html.get('.pagination .numbers').innerHTML = '';
        const { maxLeft, maxRight } = buttons.calculateMaxVisible();
        for(let page = maxLeft; page <= maxRight; page++){
            buttons.create(page);
        }
      
    },
    calculateMaxVisible(){
        const { maxVisibleButtons } = state;
        let maxLeft = (state.page - Math.floor(maxVisibleButtons / 2));
        let maxRight = (state.page + Math.floor(maxVisibleButtons / 2));
        if(maxLeft < 1){
            maxLeft = 1;
            maxRight = maxVisibleButtons;
        }

        if(maxRight > state.totalPage){
            maxLeft = state.totalPage - (maxVisibleButtons - 1);
            maxRight = state.totalPage;
            
            if(maxLeft < 1) maxLeft = 1;
        }
        return {maxLeft, maxRight}
    }
}

function openTheaterMode(img) {
    state.currentTheaterImageId = img.id;
    theaterImage.setAttribute("src", img.path);

    // title.innerHTML = img.title;
    // body.innerHTML = img.text;

    // show the image
    theaterContainer.style.display = "flex"

    // prevent body from scrolling when theater is open
    htmlbody.setAttribute("class", "modal-open")
    setParams("photo", state.currentTheaterImageId)

    return null;
}

function closeTheaterMode() {
    theaterContainer.style.display = "none"
    htmlbody.removeAttribute("class")
    state.currentTheaterImageId = "";
    deleteParam('photo');

    return null;
}

theaterImage.onclick = function(e) { e.stopPropagation();};
imgInfo.onclick = function(e) { e.stopPropagation(); };
theaterContainer.onclick = function(e) { closeTheaterMode();};
html.get(".theater-controls").onclick = function(e) { e.stopPropagation() }

function update(){
    list.update();
    buttons.update();
}
  
function init(){
    getImages(totalItems);
    pageControls.createListeners();
    theaterControls.createListeners();
    viewControls.createListeners();
    
    const initPage = url.searchParams.get("page");
    const initPhoto = url.searchParams.get("photo")

    if (initPage) {
        pageControls.goTo(initPage)
    }

    if (initPhoto) {
        let imageIndex = imagesList.map(function(obj) {return obj.id}).indexOf(initPhoto);
        openTheaterMode(imagesList[imageIndex])
    }

    map = L.map('mapContainer').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.whenReady(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 1000);
    });

    update();
}
  
init()
