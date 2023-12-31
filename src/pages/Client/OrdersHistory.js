import React, { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { useParams, useNavigate } from "react-router-dom";
import { map, size, forEach } from "lodash";
import { OrderHistoryItem } from "../../components/Client";
import { ModalConfirm } from "../../components/Common";
import { useOrder, useTable, usePayment, useAuth } from "../../hooks"; // Asumiendo que tienes un hook useAuth para gestionar la autenticación

export function OrdersHistory() {
  const [idTable, setIdTable] = useState(null);
  const [showTypePayment, setShowTypePayment] = useState(false);
  const [isRequestAccount, setIsRequestAccount] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { loading, orders, getOrdersByTable, addPaymentToOrder } = useOrder();
  const { getTableByNumber } = useTable();
  const { tableNumber } = useParams();
  const { createPayment, getPaymentByTable } = usePayment();
  const { logout } = useAuth(); // Asumiendo que tienes un método logout en tu hook useAuth
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const table = await getTableByNumber(tableNumber);
      const idTableTemp = table[0].id;
      setIdTable(idTableTemp);

      getOrdersByTable(idTableTemp, "", "ordering=-status,-created_at");
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (idTable) {
        const response = await getPaymentByTable(idTable);
        setIsRequestAccount(response);
      }
    })();
  }, [idTable, getPaymentByTable]);

  const onCreatePayment = async (paymentType) => {
    setShowTypePayment(false);

    let totalPayment = 0;
    forEach(orders, (order) => {
      totalPayment += Number(order.product_data.price);
    });

    const paymentData = {
      table: idTable,
      totalPayment: totalPayment.toFixed(2),
      paymentType,
      statusPayment: "PENDING",
    };

    const payment = await createPayment(paymentData);
    for await (const order of orders) {
      await addPaymentToOrder(order.id, payment.id);
    }

    // Marca la sesión como expirada después de 5 segundos
    setTimeout(() => {
      setSessionExpired(true);
    }, 5000);
  };

  // Utiliza useEffect para manejar la redirección cuando la sesión ha expirado
  useEffect(() => {
    if (sessionExpired) {
      // Redirige a la pantalla de inicio de sesión o a donde sea necesario
      logout(); // Llama al método logout para cerrar sesión
      navigate("/");
    }
  }, [sessionExpired, navigate, logout]);

  return (
    <div>
      <h1>Historial de pedidos</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {size(orders) > 0 && (
            <Button
              primary
              fluid
              onClick={() =>
                size(isRequestAccount) === 0 && setShowTypePayment(true)
              }
            >
              {size(isRequestAccount) > 0
                ? "La cuenta ya está pedida"
                : "Pedir la cuenta"}
            </Button>
          )}

          {map(orders, (order) => (
            <OrderHistoryItem key={order.id} order={order} />
          ))}
        </>
      )}

      <ModalConfirm
        title="Pagar con tarjeta o efectivo"
        show={showTypePayment}
        onCloseText="Efectivo"
        onClose={() => onCreatePayment("CASH")}
        onConfirmText="Tarjeta"
        onConfirm={() => onCreatePayment("CARD")}
      />
    </div>
  );
}
