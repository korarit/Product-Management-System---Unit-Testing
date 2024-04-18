const request = require("supertest")
const app = require("./index.js")

require('dotenv').config()

describe("GET /product/all", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/product/all").set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(200);
    });
});

describe("GET /product/all", () => {
    it("should return 401 Unauthorized", async () => {
        const res = await request(app).get("/product/all");
        expect(res.statusCode).toEqual(401);
    });
});

describe("GET /product/all", () => {
    it("should return 401 Unauthorized", async () => {
        const res = await request(app).get("/product/all").set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN + '123');
        expect(res.statusCode).toEqual(401);
    });
});

describe("POST /product", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: 100, amount: 10}).set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(200);
    });
});

describe("POST /product", () => {
    it("should return 401 Unauthorized", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: 100, amount: 10});
        expect(res.statusCode).toEqual(401);
    });
});

describe("POST /product", () => {
    it("should return 401 Unauthorized", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: 100, amount: 10}).set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN + '123');
        expect(res.statusCode).toEqual(401);
    });
});

describe("POST /product", () => {
    it("should return 400 Bad Request because data not complete", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: 100})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });
});

describe("POST /product", () => {
    it("should return 400 Bad Request because data not complete", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", amount: 10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});

describe("POST /product", () => {
    it("should return 400 Bad Request because data not complete", async () => {
        const res = await request(app).post("/product").send({name: "test", price: 100, amount: 10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});

describe("POST /product", () => {
    it("should return 400 Bad Request because data not complete", async () => {
        const res = await request(app).post("/product").send({type: "test", price: 100, amount: 10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});

describe("POST /product", () => {
    it("should return 400 Bad Request because amount not Number type", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: 100, amount: "10F", })
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});

describe("POST /product", () => {
    it("should return 400 Bad Request because price not Number type", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: "100F", amount: 10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});

describe("POST /product", () => {
    it("should return 400 Bad Request because amount is negative", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: 100, amount: -10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});



describe("POST /product", () => {
    it("should return 400 Bad Request because price is negative", async () => {
        const res = await request(app).post("/product").send({name: "test", type: "test", price: -100, amount: 10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(400);
    });

});

//ลบสินค้า id 2 กรณีไม่มี Authorization
describe("DELETE /product/:id", () => {
    it("should return 401 Unauthorized because not Authorization", async () => {
        const res = await request(app).delete("/product/1");
        expect(res.statusCode).toEqual(401);
    });
});

//ลบสินค้า id 2
describe("DELETE /product/:id", () => {
    it("should return 200 OK because id 27 in db", async () => {
        const res = await request(app).delete("/product/27").set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(200);
    });
});


//ลบสินค้า id 10 ซึ่งไม่มีใน db
describe("DELETE /product/:id", () => {
    it("should return 500 because id 10 data not in db", async () => {
        const res = await request(app).delete("/product/10").set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN);
        expect(res.statusCode).toEqual(404);
    });
});

//แก้ไขสินค้า id 1 กรณีไม่มี Authorization
describe("PUT /product/:id", () => {
    it("should return 401 Unauthorized because not Authorization", function (done) {
        request(app).put("/product/1").send({name: "test", type: "test", price: 100, amount: 10}).
        expect(401, done);
    });
});

//แก้ไขสินค้า id 1 กรณีมี Authorization
describe("PUT /product/:id", () => {
    it("should return 200 OK because id 1 in db", function (done) {
        request(app).put("/product/1").send({name: "test3333"}).set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN).
        expect(200, done);
    });
});

//แก้ไขสินค้า id 10 ซึ่งไม่มีใน db
describe("PUT /product/:id", () => {
    it("should return 404 because id 300 data not in db", function (done) {
        request(app).put("/product/300").send({name: "test", type: "test", price: 100, amount: 10})
        .set('Authorization', 'Bearer ' + process.env.LOGIN_TOKEN)
        .expect(404, done);
    });
});
