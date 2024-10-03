declare namespace google.maps {
  export class Map {
    constructor(element: HTMLElement, options: MapOptions);
    panTo(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  export interface MapOptions {
    center: LatLng | LatLngLiteral;
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
  }

  export class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void; // Permite adicionar ou remover o marcador do mapa
    setPosition(position: LatLng | LatLngLiteral): void; // Define a posição do marcador
  }

  export interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map: Map | null;
    label?: string | MarkerLabel; // Agora `label` pode ser uma string ou um objeto detalhado
    title?: string;
    animation?: google.maps.Animation;
    draggable?: boolean;
    icon?: string | Icon | Symbol; // Adiciona a propriedade `icon`
  }

  export interface MarkerLabel {
    text: string;         // O texto da label (as iniciais, por exemplo)
    color?: string;       // Cor da fonte
    fontWeight?: string;  // Peso da fonte (ex.: 'bold')
    fontSize?: string;    // Tamanho da fonte (ex.: '16px')
  }

  export interface MarkerIcon {
    url: string;
    scaledSize?: google.maps.Size; // Adiciona a propriedade scaledSize com o tipo google.maps.Size
  }

  export interface Size {
    width: number; // Largura em pixels
    height: number; // Altura em pixels
  }

  export interface Symbol {
    path: SymbolPath;
    scale?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeWeight?: number;
    strokeColor?: string;
  }

  export enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
    PIN = 10,
  }

  export interface LatLng {
    lat(): number;
    lng(): number;
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  // Adicionando InfoWindow
  export class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, anchor?: Marker | LatLng | LatLngLiteral): void;
    close(): void;
  }

  export interface InfoWindowOptions {
    content: string | HTMLElement; // O conteúdo pode ser uma string ou um elemento HTML
    position?: LatLng | LatLngLiteral; // Posição opcional para abrir o InfoWindow
  }

  // Adicionando o namespace para eventos
  export namespace event {
    export function addListener<T>(instance: T, eventName: string, handler: (event: Event) => void): void;
    export function removeListener(listener: Listener): void;
  }

  export interface Listener {
    remove: () => void; // Método para remover o listener
  }

  // Adicione mais interfaces e classes conforme necessário
}
