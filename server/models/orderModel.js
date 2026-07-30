const supabase = require("../config/supabase");

// Place Order
const placeOrder = async (orderData) => {

    const {
        customer_id,
        branch_id,
        total_amount,
        items
    } = orderData;

    // 1 Create Order
    const { data: order, error: orderError } =
        await supabase
            .from("orders")
            .insert([
                {
                    customer_id,
                    branch_id,
                    total_amount,
                    status: "PLACED"
                }
            ])
            .select()
            .single();

    if (orderError)
        return { error: orderError };

    // 2 Insert Order Items
    const orderItems = items.map(item => ({

        order_id: order.id,

        medicine_id: item.medicine_id,

        quantity: item.quantity,

        price: item.price

    }));

    const { error: itemError } =
        await supabase
            .from("order_items")
            .insert(orderItems);

    if (itemError)
        return { error: itemError };

    // 3 Update Stock
    for (const item of items) {

        const { data: stock } =
            await supabase
                .from("branch_stock")
                .select("quantity")
                .eq("branch_id", branch_id)
                .eq("medicine_id", item.medicine_id)
                .single();

        const newQuantity =
            stock.quantity - item.quantity;

        await supabase
            .from("branch_stock")
            .update({
                quantity: newQuantity
            })
            .eq("branch_id", branch_id)
            .eq("medicine_id", item.medicine_id);

    }

    return {

        data: order

    };

};



// Get All Orders
const getOrders = async () => {

    return await supabase
        .from("orders")
        .select("*");

};



// Get Single Order
const getOrder = async (id) => {

    return await supabase
        .from("orders")
        .select(`
            *,
            order_items(
                *,
                medicines(name)
            )
        `)
        .eq("id", id)
        .single();

};



// Update Status
const updateOrderStatus = async (id, status) => {

    return await supabase
        .from("orders")
        .update({

            status

        })
        .eq("id", id)
        .select();

};



// Cancel Order
const cancelOrder = async (id) => {

    return await supabase
        .from("orders")
        .update({

            status: "CANCELLED"

        })
        .eq("id", id)
        .select();

};

module.exports = {

    placeOrder,

    getOrders,

    getOrder,

    updateOrderStatus,

    cancelOrder

};