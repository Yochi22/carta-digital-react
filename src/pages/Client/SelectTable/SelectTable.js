import React, { useState } from "react";
import { Form, Button } from "semantic-ui-react";
import { useTable } from "../../../hooks";
import "./SelectTable.scss";
import { useNavigate } from "react-router-dom";

export function SelectTable(props) {
  const navigate = useNavigate()
  const [tableNum, setTableNum] = useState(null);
  const [error, setError] = useState(null);
  const { isExistTable } = useTable();

  const onSubmit = async () => {
    setError(null);
    if (!tableNum) {
      setError("No has introducido ninguna mesa");
    } else {
      const exist = await isExistTable(tableNum);
      if (exist) navigate(`/client/${tableNum}`);
      else setError("El numero de la mesa no existe");
    }
  };

  return (
    <div className="select-table">
      <div className="select-table__content">
        <h1>Bienvenido a la carta digital</h1>
        <h2>Introduce tu número de mesa</h2>

        <Form onSubmit={onSubmit}>
          <Form.Input
            placeholder="Ejemplo: 1, 2, 3"
            type="number"
            onChange={(_, data) => setTableNum(data.value)}
          />

          <Button primary fluid>
            Entrar
          </Button>
        </Form>

        <p className="select-table__content-error">{error}</p>
      </div>
    </div>
  );
}