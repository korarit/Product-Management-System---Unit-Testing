const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

//ใช้ dotenv เพื่อดึงค่าจากไฟล์ .env
dotenv.config();

//สร้าง express app
const app = express();

//ใช้ middleware เพื่อให้ express สามารถอ่าน body ของ request ในรูปแบบของ JSON
app.use(express.json());

//ใช้ middleware เพื่อตรวจสอบ Authorization header
app.use((req, res, next) => {
    const auth = req.headers.authorization;

    //ตรวจสอบว่ามี Authorization header หรือไม่
    if (!auth) {
        return res.status(401).json({message: "Unauthorized"});
    }
    const get_token = auth.split(" ");

    //ตรวจสอบว่า Authorization header มีรูปแบบ Bearer <token> หรือไม่
    if (get_token[0] != "Bearer" || get_token.length != 2 || !get_token[1]) {
        return res.status(401).json({message: "Unauthorized Authentication header format is Bearer <token>"});
    }

    //ตรวจสอบว่า Authorization header ตรงกับ login token หรือไม่
    if (get_token[1] == process.env.LOGIN_TOKEN) {
        next();
    } else {
        return res.status(401).json({message: "Unauthorized"});
    }
});


//ดูรายการสินค้าทั้งหมด
app.get("/product/all", async (req, res) => {

        //connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }); 

        //query all products และ ส่งข้อมูลสินค้าทั้งหมดกลับไป ในรูปแบบของ JSON Array
        try {
            const [rows, fields] = await connection.execute("SELECT id, name, type, price, amount FROM products");
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({message: "Internal server error"});
        }

    }
);

//เพิ่มสินค้า
app.post("/product", async (req, res) => {
        //รับข้อมูลสินค้าจาก body ประกอบด้วย name, type, price, amount 
        const product_data = req.body;

        //validate ข้อมูล
        if (!product_data.name || !product_data.type || !product_data.price || !product_data.amount) {
            return res.status(400).json({message: "Invalid data"});
        }else if (product_data.name.length == 0 || product_data.type.length == 0) {
            return res.status(400).json({message: "Name or type must not be empty"});
        }else if (isNaN(product_data.price) || isNaN(product_data.amount)) {
            return res.status(400).json({message: "Invalid data type for price or amount"});  
        }else if (product_data.price < 0 || product_data.amount < 0) {
            return res.status(400).json({message: "Price or amount must be positive number"});
        }

        //connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }); 

        //เพิ่มข้อมูลสินค้าลงใน database
        try {
            await connection.execute("INSERT INTO products (name, type, price, amount) VALUES (?, ?, ?, ?)", [product_data.name, product_data.type, product_data.price, product_data.amount]);
            
            return res.status(200).json({message: "Product add"});
        } catch (error) {
            return res.status(500).json({message: "Internal server error"});
        }
    }
);

//ลบสินค้า
app.delete("/product/:id", async (req, res) => {
        //รับ id ของสินค้าที่ต้องการลบ
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid id"});
        }

        //connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }); 


        try {
            //ตรวจสอบว่ามีสินค้าที่ต้องการลบหรือไม่
            const [rows, fields] = await connection.execute("SELECT id FROM products WHERE id = ?", [id]);
            if (rows.length == 0) {
                return res.status(404).json({message: "Product not found"});
            }

            //ลบสินค้า
            await connection.execute("DELETE FROM products WHERE id = ?", [id]);
            
            return res.status(200).json({message: "Product deleted"});
        } catch (error) {
            return res.status(500).json({message: "Product not found"});
        }

    }
);

//แก้ไขสินค้า
app.put("/product/:id", async (req, res) => {

        //รับ id ของสินค้าที่ต้องการแก้ไข
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid id"});
        }

        //รับข้อมูลสินค้าที่ต้องการแก้ไขจาก body ประกอบด้วย name, type, price, amount
        const product_data = req.body;

        //validate ข้อมูล ต้องมีอย่างน้อย 1 ข้อมูลที่ต้องการแก้ไข
        if (!product_data.name && !product_data.type && !product_data.price && !product_data.amount) {
            return res.status(400).json({message: "Invalid data"});
        }

        //connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }); 

        try {
            //ตรวจสอบว่ามีสินค้าที่ต้องการแก้ไขหรือไม่
            const [rows, fields] = await connection.execute("SELECT id FROM products WHERE id = ?", [id]);
            if (rows.length == 0) {
                return res.status(404).json({message: "Product not found"});
            }
        } catch (error) {
            return res.status(500).json({message: "Server error"});
        }

        //แก้ไขชื่อสินค้า
        if (product_data.name) {
            
            //validate ข้อมูล ต้องมีความยาวมากกว่า 0
            if (product_data.name.length == 0) {
                return res.status(400).json({message: "Name must not be empty"});
            }

            try {

                await connection.execute("UPDATE products SET name = ? WHERE id = ?", [product_data.name, id]);
            } catch (error) {
                return res.status(500).json({message: "Product not found"});
            }
        }

        //แก้ไขประเภทสินค้า
        if (product_data.type) {

            //validate ข้อมูล ต้องมีความยาวมากกว่า 0
            if (product_data.type.length == 0) {
                return res.status(400).json({message: "Type must not be empty"});
            }

            try {
                await connection.execute("UPDATE products SET type = ? WHERE id = ?", [product_data.type, id]);
            }catch (error) {
                return res.status(500).json({message: "Product not found"});
            }
        }

        //แก้ไขราคาสินค้า
        if (product_data.price) {

            //validate ข้อมูล ต้องเป็นตัวเลขและมากกว่า 0
            if (isNaN(product_data.price)) {
                return res.status(400).json({message: "Invalid data type for price"});
            }else if (product_data.price < 0) {
                return res.status(400).json({message: "Price must be positive number"});
            }

            try {
                await connection.execute("UPDATE products SET price = ? WHERE id = ?", [product_data.price, id]);
            } catch (error) {
                return res.status(500).json({message: "Product not found"});
            }
        }

        //แก้ไขจำนวนสินค้า
        if (product_data.amount) {

            //validate ข้อมูล ต้องเป็นตัวเลขและมากกว่า 0
            if (isNaN(product_data.amount)) {
                return res.status(400).json({message: "Invalid data type for amount"});
            }else if (product_data.amount < 0) {
                return res.status(400).json({message: "Amount must be positive number"});
            }else if (Number.isInteger(product_data.amount) == false){
                return res.status(400).json({message: "Amount must be integer number"});
            }

            try {
                await connection.execute("UPDATE products SET amount = ? WHERE id = ?", [product_data.amount, id]);

            }
            catch (error) {
                return res.status(500).json({message: "Product not found"});
            }
        }

        return res.status(200).json({message: "Product updated"});

    }
);


//เริ่มต้นเซิร์ฟเวอร์
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;