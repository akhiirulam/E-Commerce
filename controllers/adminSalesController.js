// const puppeteer = require('puppeteer');
const path = require('path');

const fs = require('fs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const ejs = require('ejs');
const Order = require('../models/orderDb');
const { Product } = require('../models/dbconnection');

let fromDate,endDate;

exports.salesGenerate = async (req,res) =>
 {

    fromDate = req.body.fromDate;
    endDate = req.body.endDate;
    const customRange = req.body.customRange;
    let products = [];
  
    switch (customRange) {
        case 'day':
            fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 1);
            endDate = new Date();
            break;
        case 'week':
            fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);
            endDate = new Date();
            break;
        case 'month':
            fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            endDate = new Date();
            break;
        default:
            // Handle default case or invalid input
            break;
    }

if(fromDate && endDate)
{
    productData = await Order.find({
    date:{
        $gte: new Date(fromDate),
        $lte: new Date(endDate)
    }
});
}
else{
    productData = await Order.find({});
}

    productData.forEach(orderObj => {
        orderObj.orders.forEach(order => {
            const product = {
                Name: order.bookName,
                Price: order.offer !== 0 ? (order.price * 100) / order.offer : order.price,
                Quantity: order.quantity,   
                Offer: order.offer === 100? 0 : order.offer,
                TotalPrice: order.price * order.quantity,
                Customer: orderObj.name,
                Address: orderObj.address,
                Email: orderObj.email,
            };
            products.push(product); // Push each product to the 'products' array
        });
    });
   
    
    res.render('admin/salesReport',{products});
}

exports.salesDownloadPDF = async (req, res) => {
    try {
       
        let totalCount =0;
        let totalAmount=0;
        let totalDiscount = 0;
        
        let products = [];
        const productData = await Order.find({
            date:{
                $gte: new Date(fromDate),
                $lte: new Date(endDate)
            }
        });
        productData.forEach(orderObj => {
            orderObj.orders.forEach(order => {
                const product = {
                    Name: order.bookName,
                    Price: order.offer !== 0 ? (order.price * 100) / order.offer : order.price,
                    Quantity: order.quantity,   
                    Offer: order.offer === 100? 0 : order.offer,
                    TotalPrice: order.price * order.quantity,
                    Customer: orderObj.name,
                    Address: orderObj.address,
                    Email: orderObj.email,
                };
                products.push(product); // Push each product to the 'products' array
            });
        });
        products.forEach(data =>{
            // console.log(data.Quantity,"|",data.TotalPrice,"|");
            totalCount +=data.Quantity; 
            totalAmount +=data.TotalPrice;
            totalDiscount +=(data.TotalPrice-data.Price);
        })
        console.log(totalCount,"|",totalAmount,"|",totalDiscount);
        const doc = new PDFDocument();
        const filename = './docs/sales_report.pdf'; // Output file path

        // Pipe the PDF content to a writable stream
        const outputStream = fs.createWriteStream(filename);
        doc.pipe(outputStream);

        // Add content to the PDF document
        doc.font('Helvetica').fontSize(12);
        doc.text('Sales Report', { align: 'center' });
        doc.moveDown();
      

       
        // Iterate over products and add them to the PDF
        products.forEach(product => {
            doc.text(`Customer: ${product.Customer}`);
            doc.text(`Address: ${product.Address}`);
            doc.text(`Email: ${product.Email}`);
            doc.text(`Offer: ${product.Offer} `)
            doc.text(`Product Name: ${product.Name}`);
            doc.text(`Price: $${product.Price.toFixed(2)}`);
            doc.text(`Quantity: ${product.Quantity}`);
            doc.text(`Total Price: $${product.TotalPrice.toFixed(2)}`);
            doc.moveDown();
        });

            doc.text(`Sales Count: ${totalCount}`);
            doc.text(`Total order amount: ${totalAmount}`);
            doc.text(`Overall Discount: ${totalDiscount}`);
        // Finalize the PDF and close the writable stream
        doc.end();
        outputStream.on('finish', () => {
            res.download(filename); // Send the generated PDF file to the client for download
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating sales report.');
    }
};


exports.salesDownloadXl = async (req, res) => {
    try {
        const productData = await Order.find({
            date:{
                $gte:new Date(fromDate),
                $lte: new Date(endDate)
                        
            }
        });
        let totalCount =0;
        let totalAmount=0;
        let totalDiscount = 0;
        let products = []; // Initialize an empty array to store products

        productData.forEach(orderObj => {
            orderObj.orders.forEach(order => {
                const product = {
                    Name: order.bookName,
                    Price: order.offer !== 0 ? (order.price * 100) / order.offer : order.price,
                    Quantity: order.quantity,
                    Offer: order.offer === 100? 0 : order.offer,
                    TotalPrice: order.price * order.quantity,
                    Customer: orderObj.name,
                    Address: orderObj.address,
                    Email: orderObj.email,
                };
                products.push(product); // Push each product to the 'products' array
            });
        });

        // Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
        products.forEach(data =>{
            // console.log(data.Quantity,"|",data.TotalPrice,"|");
            totalCount +=data.Quantity; 
            totalAmount +=data.TotalPrice;
            totalDiscount +=(data.TotalPrice-data.Price);
        })

        // Add column headers
        worksheet.columns = [
            { header: 'Customer', key: 'Customer' },
            { header: 'Address', key: 'Address' },
            { header: 'Email', key: 'Email' },
            { header: 'Product Name', key: 'Name' },
            { header: 'Price', key: 'Price' },
            { header: 'Offer', key: 'Offer' },
            { header: 'Quantity', key: 'Quantity' },
            { header: 'Total Price', key: 'TotalPrice' },
            { header: 'Sales Count', key: 'TotalCount' },
            { header: 'Total order amount', key: 'TotalAmount' },
            { header: 'Overall Discount', key: 'TotalDiscount' }
        ];
        
        // Populate the worksheet with sales report data
        products.forEach(product => {
            worksheet.addRow(product);
        });
        worksheet.addRow({TotalCount: totalCount, TotalAmount: totalAmount, TotalDiscount: totalDiscount});
        // Save the Excel file to a specified location
        const excelFilePath = './docs/sales_report.xlsx';
        await workbook.xlsx.writeFile(excelFilePath);

        // Send the generated Excel file to the client
        res.sendFile(path.resolve(excelFilePath));
    } catch (error) {
        console.error('Error generating Excel file:', error);
        // Handle errors appropriately, e.g., send an error response to the client
        res.status(500).send('Error generating sales report.');
    }
};