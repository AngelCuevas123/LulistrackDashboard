import { useEffect, useRef, useState } from "react";
import { MapPin, Search, LoaderCircle, MapPinned } from "lucide-react";
import { buscarCodigoPostal, buscarDirecciones } from "../services/api";

function AddressAutocomplete({ value, onChange, onCoordinates }) {
  const [localidades, setLocalidades] = useState([]);
  const [cargandoCP, setCargandoCP] = useState(false);
  const [errorCP, setErrorCP] = useState("");
  const [consultaCalle, setConsultaCalle] = useState(value.street || "");
  const [resultados, setResultados] = useState([]);
  const [buscandoCalle, setBuscandoCalle] = useState(false);
  const [errorCalle, setErrorCalle] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const consultaAnterior = useRef("");

  useEffect(() => {
    setConsultaCalle(value.street || "");
  }, [value.street]);

  useEffect(() => {
    if (!/^\d{5}$/.test(value.postal_code || "")) {
      setLocalidades([]);
      setErrorCP("");
      return;
    }

    let activo = true;
    setCargandoCP(true);
    setErrorCP("");

    buscarCodigoPostal(value.postal_code)
      .then((data) => {
        if (!activo) return;
        const places = Array.isArray(data.places) ? data.places : [];
        setLocalidades(places);
        if (!places.length) {
          setErrorCP("No hay localidades disponibles para este código. Puedes completar los datos manualmente.");
          return;
        }
        const primera = places[0];
        onChange({
          state: primera.state || value.state,
          locality: places.length === 1 ? (primera.name || "") : value.locality
        });
        if (places.length === 1 && primera.latitude != null && primera.longitude != null) {
          onCoordinates({ latitude: primera.latitude, longitude: primera.longitude });
        }
      })
      .catch((error) => {
        if (activo) setErrorCP(error.message || "No se pudo consultar el código postal.");
      })
      .finally(() => {
        if (activo) setCargandoCP(false);
      });

    return () => { activo = false; };
  }, [value.postal_code]);

  useEffect(() => {
    const query = consultaCalle.trim();
    if (query.length < 3 || !/^\d{5}$/.test(value.postal_code || "")) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    const searchKey = [query, value.postal_code, value.locality, value.municipality, value.state].join("|");
    if (searchKey === consultaAnterior.current) return;
    const timer = setTimeout(() => {
      consultaAnterior.current = searchKey;
      setBuscandoCalle(true);
      setErrorCalle("");
      buscarDirecciones({
        q: query,
        postal_code: value.postal_code,
        locality: value.locality,
        municipality: value.municipality,
        state: value.state
      })
        .then((data) => {
          setResultados(data.results || []);
          setMostrarResultados(true);
        })
        .catch((error) => setErrorCalle(error.message || "No se pudo buscar la dirección."))
        .finally(() => setBuscandoCalle(false));
    }, 450);

    return () => {
      clearTimeout(timer);
    };
  }, [consultaCalle, value.postal_code, value.locality, value.municipality, value.state]);

  function cambiar(campo, dato) {
    onChange({ [campo]: dato });
  }

  function seleccionarLocalidad(nombre) {
    const place = localidades.find((item) => item.name === nombre);
    onChange({ locality: nombre, state: place?.state || value.state });
    if (place?.latitude != null && place?.longitude != null) {
      onCoordinates({ latitude: place.latitude, longitude: place.longitude });
    }
  }

  function seleccionarResultado(item) {
    onChange({
      street: item.street || item.name || consultaCalle,
      colony: item.district || value.colony,
      locality: item.locality || value.locality,
      municipality: item.municipality || value.municipality,
      state: item.state || value.state,
      postal_code: /^\d{5}$/.test(item.postal_code || "") ? item.postal_code : value.postal_code
    });
    onCoordinates({ latitude: item.latitude, longitude: item.longitude });
    setConsultaCalle(item.street || item.name || consultaCalle);
    setMostrarResultados(false);
  }

  return (
    <section className="address-autocomplete">
      <div className="address-section-heading">
        <MapPinned size={18} />
        <div>
          <strong>Dirección de entrega</strong>
          <p>Consulta nacional de códigos postales y búsqueda de calles o caminos.</p>
        </div>
      </div>

      <div className="address-fields-grid">
        <div className="form-group">
          <label htmlFor="address-postal-code">Código postal</label>
          <div className="address-input-with-status">
            <input
              id="address-postal-code"
              inputMode="numeric"
              maxLength={5}
              value={value.postal_code || ""}
              onChange={(event) => cambiar("postal_code", event.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="Ej. 36200"
              pattern="[0-9]{5}"
              title="Escribe un código postal de cinco dígitos"
              required
            />
            {cargandoCP && <LoaderCircle className="address-spinner" size={17} />}
          </div>
          <small>Ingresa los cinco dígitos para consultar las localidades.</small>
          {errorCP && <small className="address-feedback">{errorCP}</small>}
        </div>

        <div className="form-group">
          <label htmlFor="address-state">Estado</label>
          <input id="address-state" value={value.state || ""} onChange={(event) => cambiar("state", event.target.value)} placeholder="Estado" />
        </div>

        <div className="form-group">
          <label htmlFor="address-municipality">Municipio</label>
          <input id="address-municipality" value={value.municipality || ""} onChange={(event) => cambiar("municipality", event.target.value)} placeholder="Municipio o alcaldía" />
        </div>

        <div className="form-group">
          <label htmlFor="address-locality">Localidad / ranchería</label>
          {localidades.length > 0 ? (
            <select id="address-locality" value={value.locality || ""} onChange={(event) => seleccionarLocalidad(event.target.value)}>
              <option value="">Selecciona una localidad</option>
              {localidades.map((place, index) => <option key={`${place.name}-${index}`} value={place.name}>{place.name}</option>)}
            </select>
          ) : (
            <input id="address-locality" value={value.locality || ""} onChange={(event) => cambiar("locality", event.target.value)} placeholder="Localidad o comunidad" />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address-colony">Colonia / asentamiento</label>
          <input id="address-colony" value={value.colony || ""} onChange={(event) => cambiar("colony", event.target.value)} placeholder="Colonia, barrio o ranchería" />
        </div>

        <div className="form-group address-street-field">
          <label htmlFor="address-street-search">Calle o camino</label>
          <div className="address-input-with-status">
            <Search size={17} />
            <input
              id="address-street-search"
              value={consultaCalle}
              onChange={(event) => {
                setConsultaCalle(event.target.value);
                cambiar("street", event.target.value);
              }}
              onFocus={() => resultados.length > 0 && setMostrarResultados(true)}
              placeholder="Escribe para buscar calles y caminos..."
              autoComplete="off"
            />
            {buscandoCalle && <LoaderCircle className="address-spinner" size={17} />}
          </div>
          {mostrarResultados && resultados.length > 0 && (
            <div className="address-suggestions">
              {resultados.map((item, index) => (
                <button type="button" key={`${item.name}-${index}`} onClick={() => seleccionarResultado(item)}>
                  <MapPin size={15} />
                  <span><strong>{item.name}</strong><small>{[item.district, item.locality, item.state].filter(Boolean).join(", ")}</small></span>
                </button>
              ))}
            </div>
          )}
          {errorCalle && <small className="address-feedback">{errorCalle}</small>}
          <small>La cobertura de calles rurales depende de los datos cartográficos disponibles.</small>
        </div>

        <div className="form-group">
          <label htmlFor="address-exterior">Número exterior</label>
          <input id="address-exterior" value={value.exterior_number || ""} onChange={(event) => cambiar("exterior_number", event.target.value)} placeholder="S/N si no existe" />
        </div>

        <div className="form-group">
          <label htmlFor="address-interior">Número interior</label>
          <input id="address-interior" value={value.interior_number || ""} onChange={(event) => cambiar("interior_number", event.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address-references">Referencias para el repartidor</label>
        <textarea id="address-references" rows={2} value={value.address_references || ""} onChange={(event) => cambiar("address_references", event.target.value)} placeholder="Ej. Portón negro, frente a la escuela, camino de terracería..." />
      </div>
    </section>
  );
}

export default AddressAutocomplete;
