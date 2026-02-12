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
    currentTheaterImage: {},
    map: {
        points: [],
        zoom: 10
    }
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
var map = null;


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
            url.searchParams.set('photo', imagesList[imageIndex].Index);
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

const mapControls = {
    openMapSlice(){
        openMapSliceView();
    },
    openMapSingle(){
        openMapSingleView();
    },
    openMapAll() {
        openMapAllView();
    },
    closeMap() {
        closeMapView();
    },
    createListeners(){
        html.get('.map-button').addEventListener("click", ()=>{
            mapControls.openMapSlice();
            update();
        })
        html.get('.map-close-button').addEventListener("click", ()=>{
            mapControls.closeMap();
            update();
        })
        html.get('.theater-control-map').addEventListener("click", ()=>{
            mapControls.openMapSingle();
            update();
        })
        html.get('.map-all-button').addEventListener("click", ()=>{
            mapControls.openMapAll();
            update();
        })
    }

}

function openMapSliceView() {
    var firstPhotoIndex = (state.page - 1) * state.imgPerPage;
    var lastPhotoIndex = state.page * state.imgPerPage;
    var arrSlice = imagesList.slice(firstPhotoIndex, lastPhotoIndex);

    showMapView();
    setUpMap(arrSlice);
    setMarkers(arrSlice);
    

    return null;
}

function openMapSingleView() {
    showMapView();
    setUpMap([state.currentTheaterImage]);
    setMarkers([state.currentTheaterImage]);

    return null;
}

function openMapAllView() {
    showMapView();
    // setUpMap(imagesList);
    setMarkers(imagesList);

    return null;
}

function setUpMap(arrSlice) {
    var coordinates = setInitialMapView(arrSlice);
    var zoomLevel = setInitialMapZoomLevel(arrSlice);

    map = L.map('mapContainer').setView(coordinates, zoomLevel);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

function setMarkers(arrSlice) {
    for (i=0; i<arrSlice.length; i++) {
        if (arrSlice[i].GPSLatitude && arrSlice[i].GPSLongitude) {
            const decLat = dmsToDecimal(arrSlice[i].GPSLatitude);
            const decLng = dmsToDecimal(arrSlice[i].GPSLongitude);
            L.marker([decLat, decLng]).addTo(map)
            .bindPopup(setMarkerPopupContent(arrSlice[i]));
        }
    }
}


function dmsToDecimal(dmsString) {
    // Example input: "48 deg 28' 26.86\" N" or "123 deg 12' 34.56\" W"
    
    // Regex to extract DMS parts and direction
    const regex = /(\d+)[^\d]+(\d+)[^\d]+(\d+(?:\.\d+)?)[^\d]*([NSEW])/i;
    const match = dmsString.match(regex);

    if (!match) {
        throw new Error('Invalid DMS format');
    }

    let degrees = parseInt(match[1], 10);
    let minutes = parseInt(match[2], 10);
    let seconds = parseFloat(match[3]);
    let direction = match[4].toUpperCase();

    // Convert to decimal
    let decimal = degrees + (minutes / 60) + (seconds / 3600);

    // If direction is South or West, make it negative
    if (direction === 'S' || direction === 'W') {
        decimal *= -1;
    }

    return decimal;
}

function setMarkerPopupContent(photoData) {
    return(`
        <img src="${photoData.SourceFile}" style="max-height:300px; max-width: 300px;"></img>
        `)
}

function showMapView() {
    mapC.style.display = "flex";

    // prevent body from scrolling when theater is open
    htmlbody.setAttribute("class", "modal-open")
}

function closeMapView() {
    mapC.style.display = "none"
    htmlbody.removeAttribute("class")

    map.remove();

    return null;
}

function setInitialMapView(arrSlice) {
    
    return getAverageCoordinates(arrSlice) ?? [0,0];
}

function getAverageCoordinates(arr) {
    var coordinates = arr.filter(obj => obj.GPSLatitude && obj.GPSLongitude);

    if (!coordinates || coordinates.length === 0) {
        return null;
    }

    let totalLat = 0;
    let totalLng = 0;

    for (const coord of coordinates) {
        const decLat = dmsToDecimal(coord.GPSLatitude);
        const decLng = dmsToDecimal(coord.GPSLongitude);
        totalLat += decLat;
        totalLng += decLng;
    }

    const avgLat = totalLat / coordinates.length;
    const avgLng = totalLng / coordinates.length;

    return [avgLat, avgLng];
}

function setInitialMapZoomLevel(arrSlice) {
    return (10);
}


const theaterControls = {
    next(){
        let nextImageIndex = imagesList.map(function(obj) {return obj.Index}).indexOf(state.currentTheaterImage.Index) + 1;

        if (nextImageIndex < totalItems) {
            openTheaterMode(imagesList[nextImageIndex])
            setParams('photo', nextImageIndex)
        }

        var calculatedPage = Math.trunc(state.currentTheaterImage.Index / imgPerPage + 1);
        state.page = calculatedPage;

        setParams('page');
    },
    prev(){
        let prevImageIndex = imagesList.map(function(obj) {return obj.Index}).indexOf(state.currentTheaterImage.Index) - 1;

        if (prevImageIndex >= 0) {
            openTheaterMode(imagesList[prevImageIndex])
            setParams('photo', prevImageIndex)
        }

        var calculatedPage = Math.trunc(state.currentTheaterImage.Index / imgPerPage + 1);
        state.page = calculatedPage;

        setParams('page');
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
            image.setAttribute("src", value.SourceFile);
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
    state.currentTheaterImage = img;
    theaterImage.setAttribute("src", state.currentTheaterImage.SourceFile);

    // title.innerHTML = img.title;
    // body.innerHTML = img.text;

    // show the image
    theaterContainer.style.display = "flex"

    // prevent body from scrolling when theater is open
    htmlbody.setAttribute("class", "modal-open")

    setParams("photo", img.Index)

    return null;
}

function closeTheaterMode() {
    theaterContainer.style.display = "none"
    htmlbody.removeAttribute("class")
    state.currentTheaterImage = {};
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
    mapControls.createListeners();
    
    const initPage = parseInt(url.searchParams.get("page"));
    const initPhoto = parseInt(url.searchParams.get("photo"));

    if (initPage) {
        pageControls.goTo(initPage)
    }

    if (initPhoto) {
        let imageIndex = imagesList.map(function(obj) {return obj.Index}).indexOf(initPhoto);
        openTheaterMode(imagesList[imageIndex])
    }
    
    update();
}
  


init()
