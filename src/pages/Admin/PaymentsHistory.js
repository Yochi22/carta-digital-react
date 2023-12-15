import React, { useState, useEffect } from "react";
import { Loader, Input, Button } from "semantic-ui-react";
import { HeaderPage, TablePayments } from "../../components/Admin";
import { usePayment } from "../../hooks";
import * as XLSX from "xlsx";
import "../../scss/PaymentHistory.scss"

export function PaymentsHistory() {
  const { loading, payments, getPayments } = usePayment();
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    getPayments();
  }, []);

  const filterPaymentsByDate = () => {
    return selectedDate
      ? payments.filter(
          (payment) =>
            payment.created_at && payment.created_at.includes(selectedDate)
        )
      : payments;
  };

  const exportToExcel = () => {
    const dataset = filterPaymentsByDate().map((payment) => ({
      ID: payment.id,
      Table: payment.table,
      Amount: payment.totalPayment,
      PaymentType: payment.paymentType,
      Date: payment.created_at,
      Status: payment.statusPayment,
    }));

    const ws = XLSX.utils.json_to_sheet(dataset);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payments.xlsx");
  };

  return (
    <div className="payments-history-container">
      <HeaderPage title="Historial de pagos" />
      <Input
        type="date"
        label="Filtrar por fecha"
        onChange={(e, { value }) => setSelectedDate(value)}
      />
      {loading ? (
        <Loader active inline="centered">
          Cargando...
        </Loader>
      ) : (
        <>
          <TablePayments payments={filterPaymentsByDate()} />
          <Button primary onClick={exportToExcel}>
            Exportar a Excel
          </Button>
        </>
      )}
    </div>
  );
}
