import React, { useEffect, useState } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';

interface Props {
  selectedPositionCallback: any
}

const ContainerMap: React.FC<Props> = (props) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([-23.5418248, -46.69655]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setSelectedPosition([latitude, longitude]);

      props.selectedPositionCallback(latitude, longitude);
    });
  }, []);

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);

    props.selectedPositionCallback(event.latlng.lat, event.latlng.lng);
  }

  return (
    <Map center={selectedPosition} zoom={16} onClick={handleMapClick}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={selectedPosition} />
    </Map>
  );
}

export default ContainerMap;
