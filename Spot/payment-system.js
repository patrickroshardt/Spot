// Sistema de Pagos para Spot
class PaymentSystem {
    constructor() {
        this.commissionRate = 0.10; // 10% de comisión por defecto
        this.paymentMethods = {
            'tarjeta': {
                name: 'Tarjeta de Crédito/Débito',
                icon: 'fas fa-credit-card',
                enabled: true,
                fee: 0.035 // 3.5% de comisión
            },
            'paypal': {
                name: 'PayPal',
                icon: 'fab fa-paypal',
                enabled: true,
                fee: 0.034 // 3.4% de comisión
            },
            'transferencia': {
                name: 'Transferencia Bancaria',
                icon: 'fas fa-university',
                enabled: true,
                fee: 0.01 // 1% de comisión
            },
            'efectivo': {
                name: 'Efectivo',
                icon: 'fas fa-money-bill-wave',
                enabled: true,
                fee: 0 // Sin comisión
            }
        };
    }

    // Calcular precio final con comisiones
    calculateFinalPrice(eventPrice, paymentMethod) {
        const method = this.paymentMethods[paymentMethod];
        if (!method) return eventPrice;

        const paymentFee = eventPrice * method.fee;
        const spotCommission = eventPrice * this.commissionRate;
        const totalFees = paymentFee + spotCommission;
        
        return {
            originalPrice: eventPrice,
            paymentFee: paymentFee,
            spotCommission: spotCommission,
            totalFees: totalFees,
            finalPrice: eventPrice + totalFees,
            breakdown: {
                eventPrice: eventPrice,
                paymentFee: paymentFee,
                spotCommission: spotCommission,
                total: eventPrice + totalFees
            }
        };
    }

    // Procesar pago
    async processPayment(eventId, ticketQuantity, paymentMethod, customerInfo) {
        try {
            // Simular procesamiento de pago
            const event = this.getEventById(eventId);
            if (!event) throw new Error('Evento no encontrado');

            const totalPrice = this.calculateFinalPrice(event.precio * ticketQuantity, paymentMethod);
            
            // Aquí integrarías con APIs reales como:
            // - Stripe para tarjetas
            // - PayPal para PayPal
            // - Bancos locales para transferencias
            
            const paymentResult = await this.simulatePayment({
                amount: totalPrice.finalPrice,
                method: paymentMethod,
                customer: customerInfo,
                event: event
            });

            if (paymentResult.success) {
                // Guardar venta
                this.saveSale({
                    eventId: eventId,
                    eventName: event.titulo,
                    company: event.empresa,
                    tickets: ticketQuantity,
                    amount: totalPrice.finalPrice,
                    commission: totalPrice.spotCommission,
                    paymentMethod: paymentMethod,
                    customer: customerInfo,
                    transactionId: paymentResult.transactionId,
                    date: new Date().toISOString()
                });

                // Enviar confirmación
                this.sendConfirmation(customerInfo.email, {
                    event: event,
                    tickets: ticketQuantity,
                    total: totalPrice.finalPrice,
                    transactionId: paymentResult.transactionId
                });

                // Agregar ticket al usuario si está logueado
                if (window.currentUser && window.addUserTicket) {
                    window.addUserTicket({
                        transactionId: paymentResult.transactionId,
                        eventName: event.titulo,
                        eventDate: event.fecha,
                        eventTime: event.hora,
                        eventLocation: event.ubicacion,
                        amount: totalPrice.finalPrice,
                        tickets: ticketQuantity
                    });
                }

                return {
                    success: true,
                    transactionId: paymentResult.transactionId,
                    total: totalPrice.finalPrice,
                    breakdown: totalPrice.breakdown
                };
            } else {
                throw new Error(paymentResult.error);
            }
        } catch (error) {
            console.error('Error procesando pago:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Simular pago (reemplazar con APIs reales)
    async simulatePayment(paymentData) {
        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular éxito/fallo aleatorio (90% éxito)
        const success = Math.random() > 0.1;
        
        if (success) {
            return {
                success: true,
                transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                paymentMethod: paymentData.method,
                amount: paymentData.amount
            };
        } else {
            return {
                success: false,
                error: 'Error procesando el pago. Intenta nuevamente.'
            };
        }
    }

    // Guardar venta
    saveSale(saleData) {
        let sales = JSON.parse(localStorage.getItem('spotSales')) || [];
        sales.push(saleData);
        localStorage.setItem('spotSales', JSON.stringify(sales));
    }

    // Obtener evento por ID
    getEventById(eventId) {
        let events = JSON.parse(localStorage.getItem('adminEvents')) || [];
        return events.find(event => event.id == eventId);
    }

    // Enviar confirmación por email
    sendConfirmation(email, orderData) {
        // Aquí integrarías con un servicio de email como:
        // - SendGrid
        // - Mailgun
        // - Amazon SES
        
        console.log('Enviando confirmación a:', email);
        console.log('Datos del pedido:', orderData);
        
        // Por ahora, mostrar en consola
        alert(`¡Compra exitosa! Se envió confirmación a ${email}`);
    }

    // Obtener reportes de ventas
    getSalesReport(startDate, endDate) {
        let sales = JSON.parse(localStorage.getItem('spotSales')) || [];
        
        if (startDate && endDate) {
            sales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
            });
        }

        const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
        const totalCommission = sales.reduce((sum, sale) => sum + sale.commission, 0);
        const totalTickets = sales.reduce((sum, sale) => sum + sale.tickets, 0);

        return {
            totalSales: totalSales,
            totalCommission: totalCommission,
            totalTickets: totalTickets,
            sales: sales,
            summary: {
                averageTicketPrice: totalSales / totalTickets || 0,
                commissionRate: (totalCommission / totalSales) * 100 || 0
            }
        };
    }

    // Obtener ventas por empresa
    getSalesByCompany(companyName) {
        let sales = JSON.parse(localStorage.getItem('spotSales')) || [];
        return sales.filter(sale => sale.company === companyName);
    }

    // Calcular comisiones para empresa
    calculateCompanyCommission(companyName) {
        const companySales = this.getSalesByCompany(companyName);
        const totalSales = companySales.reduce((sum, sale) => sum + sale.amount, 0);
        const totalCommission = companySales.reduce((sum, sale) => sum + sale.commission, 0);
        
        return {
            totalSales: totalSales,
            totalCommission: totalCommission,
            netAmount: totalSales - totalCommission,
            sales: companySales
        };
    }
}

// Instancia global del sistema de pagos
window.paymentSystem = new PaymentSystem();

// Función para mostrar modal de pago
function showPaymentModal(eventId) {
    const event = window.paymentSystem.getEventById(eventId);
    if (!event) {
        alert('Evento no encontrado');
        return;
    }

    // Crear modal de pago
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'paymentModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closePaymentModal()">&times;</span>
            <div class="modal-body">
                <h2>Comprar Entradas - ${event.titulo}</h2>
                
                <div class="payment-form">
                    <div class="form-group">
                        <label>Cantidad de entradas:</label>
                        <input type="number" id="ticketQuantity" min="1" max="10" value="1">
                    </div>
                    
                    <div class="form-group">
                        <label>Método de pago:</label>
                        <select id="paymentMethod">
                            ${event.metodosPago.map(method => {
                                const methodInfo = window.paymentSystem.paymentMethods[method];
                                return `<option value="${method}">${methodInfo.name}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre completo:</label>
                        <input type="text" id="customerName" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="customerEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Teléfono:</label>
                        <input type="tel" id="customerPhone" required>
                    </div>
                    
                    <div id="priceBreakdown" class="price-breakdown">
                        <!-- Se calculará dinámicamente -->
                    </div>
                    
                    <button class="btn-buy" onclick="processPayment(${eventId})">
                        <i class="fas fa-credit-card"></i> Procesar Pago
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Actualizar precio cuando cambie cantidad o método de pago
    document.getElementById('ticketQuantity').addEventListener('input', updatePrice);
    document.getElementById('paymentMethod').addEventListener('change', updatePrice);
    
    updatePrice();

    function updatePrice() {
        const quantity = parseInt(document.getElementById('ticketQuantity').value) || 1;
        const method = document.getElementById('paymentMethod').value;
        const priceBreakdown = window.paymentSystem.calculateFinalPrice(event.precio * quantity, method);
        
        document.getElementById('priceBreakdown').innerHTML = `
            <div class="breakdown-item">
                <span>Precio por entrada:</span>
                <span>$${event.precio.toFixed(2)}</span>
            </div>
            <div class="breakdown-item">
                <span>Cantidad:</span>
                <span>${quantity}</span>
            </div>
            <div class="breakdown-item">
                <span>Subtotal:</span>
                <span>$${priceBreakdown.originalPrice.toFixed(2)}</span>
            </div>
            <div class="breakdown-item">
                <span>Comisión de pago:</span>
                <span>$${priceBreakdown.paymentFee.toFixed(2)}</span>
            </div>
            <div class="breakdown-item">
                <span>Comisión Spot:</span>
                <span>$${priceBreakdown.spotCommission.toFixed(2)}</span>
            </div>
            <div class="breakdown-item total">
                <span><strong>Total:</strong></span>
                <span><strong>$${priceBreakdown.finalPrice.toFixed(2)}</strong></span>
            </div>
        `;
    }
}

// Procesar pago
async function processPayment(eventId) {
    const quantity = parseInt(document.getElementById('ticketQuantity').value);
    const method = document.getElementById('paymentMethod').value;
    const customerInfo = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value
    };

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        alert('Por favor completa todos los campos');
        return;
    }

    const result = await window.paymentSystem.processPayment(eventId, quantity, method, customerInfo);
    
    if (result.success) {
        closePaymentModal();
        alert(`¡Compra exitosa! ID de transacción: ${result.transactionId}`);
    } else {
        alert(`Error: ${result.error}`);
    }
}

// Cerrar modal de pago
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.remove();
    }
}
