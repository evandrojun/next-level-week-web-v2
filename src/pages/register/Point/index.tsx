import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import ibge from '../../../services/ibge';
import server from '../../../services/server';
import logo from '../../../assets/logo.svg';
import ContainerMap from '../../../components/ContainerMap';
import { Item, IbgeResponse } from '../../../utils/project_interfaces';

import './styles.css';

const Point = () => {
  const history = useHistory();

  const [items, setItems] = useState<Array<Item>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);

  const [ufs, setUfs] = useState<Array<string>>([]);
  const [selectedUf, setSelectedUf] = useState<string>('');
  const [cities, setCities] = useState<Array<string>>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  useEffect(() => {
    server.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    ibge.get<Array<IbgeResponse>>('/localidades/estados').then(response => {
      const stateInitials = response.data.map(uf => uf.sigla);

      setUfs(stateInitials);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    ibge.get<Array<IbgeResponse>>(`/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome);

      setCities(cityNames);
    });
  }, [selectedUf]);

  function handleUfSelection(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);

    ibge.get<Array<IbgeResponse>>(`/localidades/estados/${uf}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome);

      setCities(cityNames);
    });
  }

  function handleCitySelection(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleItemClick(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const items = selectedItems;

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;

    const [latitude, longitude] = selectedPosition;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    await server.post('points', data);

    alert('Ponto de coleta criado!');

    history.push('/');
  }

  function selectedPositionCallback(latitude: number, longitude: number) {
    setSelectedPosition([latitude, longitude]);
  }

  return (
    <div id="page-register-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <ContainerMap selectedPositionCallback={selectedPositionCallback} />

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>

              <select name="uf" id="uf" value={selectedUf} onChange={handleUfSelection}>
                <option value="0">Selecione um estado (UF)</option>

                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>

              <select name="city" id="city" value={selectedCity} onChange={handleCitySelection}>
                <option value="0">Selecione uma cidade</option>

                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
};

export default Point;
