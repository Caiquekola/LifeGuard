const { expect } = require('chai');
const { describe, it, beforeEach } = require('poku');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let window, document, map, selectedMarker;

beforeEach(() => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="map"></div><input type="text" id="location-input"><button id="search-location"></button><button id="gps-button"></button><button id="confirm-location"></button></body></html>`, { runScripts: "dangerously" });
    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.navigator = { geolocation: { getCurrentPosition: (success) => { success({ coords: { latitude: 0, longitude: 0 } }) } } };
    global.fetch = require('node-fetch');

    const script = require('/scripts/script.js');
});

describe('Map Initialization', () => {
    it('should initialize the map', () => {
        expect(map).to.not.be.null;
        expect(map.getCenter().lat).to.equal(-14.2350);
        expect(map.getCenter().lng).to.equal(-51.9253);
    });
});

describe('Add Marker', () => {
    it('should add a marker to the map', () => {
        const latlng = { lat: 0, lng: 0 };
        addMarker(latlng);
        expect(selectedMarker).to.not.be.null;
        expect(selectedMarker.getLatLng().lat).to.equal(0);
        expect(selectedMarker.getLatLng().lng).to.equal(0);
    });
});

describe('Search Location', () => {
    it('should search and find a location', async () => {
        document.getElementById('location-input').value = 'Brasilia';
        document.getElementById('search-location').click();

        // Simule a resposta da API Nominatim
        global.fetch = () => Promise.resolve({
            json: () => Promise.resolve([{ lat: '-15.8267', lon: '-47.9218' }])
        });

        await searchLocation('Brasilia');
        expect(map.getCenter().lat).to.equal(-15.8267);
        expect(map.getCenter().lng).to.equal(-47.9218);
    });
});

describe('Get Weather Alerts', () => {
    it('should get weather alerts for a location', async () => {
        global.fetch = () => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                current_weather: { temperature: 25, weathercode: 0 }
            })
        });

        await getWeatherAlerts(0, 0);
        expect(window.location.href).to.include('temperatura.html');
        expect(window.location.href).to.include('temp=25');
        expect(window.location.href).to.include('weatherCode=0');
        expect(window.location.href).to.include('lat=0');
        expect(window.location.href).to.include('lon=0');
    });
});
