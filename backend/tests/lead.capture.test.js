import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import {
        __setLeadControllerDeps,
        payContactFeeCapture,
        payPlanCapture,
} from "../controllers/lead.controller.js";

const createLeadDoc = (overrides = {}) => ({
        _id: "507f1f77bcf86cd799439011",
        userId: "507f1f77bcf86cd799439012",
        email: "owner@example.com",
        contactFeePaid: false,
        planPaid: false,
        status: "NEW",
        saveCalls: 0,
        async save() {
                this.saveCalls += 1;
                return this;
        },
        toJSON() {
                return { ...this };
        },
        ...overrides,
});

const buildApp = () => {
        const app = express();
        app.use(express.json());
        app.use((req, _res, next) => {
                req.user = { _id: "507f1f77bcf86cd799439012", email: "owner@example.com", role: "customer" };
                next();
        });
        app.post("/leads/:leadId/pay-contact-fee/capture", payContactFeeCapture);
        app.post("/leads/:leadId/pay-plan/capture", payPlanCapture);
        return app;
};

afterEach(() => {
        __setLeadControllerDeps({
                LeadModel: {
                        findById: async () => null,
                        findOne: () => ({ sort: async () => null }),
                        create: async () => null,
                        find: () => ({ sort: () => ({ lean: async () => [] }) }),
                },
                capturePayPal: async () => ({ status: "COMPLETED", purchase_units: [{ payments: { captures: [{ id: "CAP" }] } }] }),
        });
});

test("captures contact fee payment and returns updated lead", async () => {
        const lead = createLeadDoc();
        __setLeadControllerDeps({
                LeadModel: {
                        findById: async () => lead,
                },
                capturePayPal: async () => ({
                        id: "ORDER-1",
                        status: "COMPLETED",
                        update_time: "2024-01-01T00:00:00Z",
                        purchase_units: [{ payments: { captures: [{ id: "CAP-CONTACT" }] } }],
                }),
        });

        const app = buildApp();
        const response = await request(app)
                .post(`/leads/${lead._id}/pay-contact-fee/capture`)
                .send({ orderId: "ORDER-1" });

        assert.equal(response.status, 200);
        assert.equal(response.body.contactFeePaid, true);
        assert.equal(response.body.contactFeeTransactionId, "CAP-CONTACT");
        assert.equal(response.body.contactFeePaypalOrderId, "ORDER-1");
        assert.equal(response.body.status, "CONTACT_FEE_PAID");
});

test("captures plan payment and returns updated lead", async () => {
        const lead = createLeadDoc({ contactFeePaid: true, status: "CONTACT_FEE_PAID" });
        __setLeadControllerDeps({
                LeadModel: {
                        findById: async () => lead,
                },
                capturePayPal: async () => ({
                        id: "ORDER-2",
                        status: "COMPLETED",
                        update_time: "2024-01-01T00:00:00Z",
                        purchase_units: [{ payments: { captures: [{ id: "CAP-PLAN" }] } }],
                }),
        });

        const app = buildApp();
        const response = await request(app).post(`/leads/${lead._id}/pay-plan/capture`).send({ orderId: "ORDER-2" });

        assert.equal(response.status, 200);
        assert.equal(response.body.planPaid, true);
        assert.equal(response.body.planTransactionId, "CAP-PLAN");
        assert.equal(response.body.planPaypalOrderId, "ORDER-2");
        assert.equal(response.body.status, "PLAN_PAID");
});
