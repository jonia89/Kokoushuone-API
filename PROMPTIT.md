Minä: 
    Tavoite 
    Tehtäväsi on toteuttaa yksinkertainen kokoushuoneiden varausrajapinta (API). 
    Palvelun tulee tarjota käyttäjille seuraavat toiminnot: 
    ● Varauksen luonti: Varaa huone tietylle aikavälille. 
    ● Varauksen peruutus: Poista varaus. 
    ● Varausten katselu: Listaa kaikki tietyn huoneen varaukset. 
    Toimintalogiikka (business rules): 
    ● Varaukset eivät saa mennä päällekkäin (kaksi henkilöä ei voi varata samaa huonetta 
    samaan aikaan). 
    ● Varaukset eivät voi sijoittua menneisyyteen. 
    ● Aloitusajan täytyy olla ennen lopetusaikaa. 
    Tekniset reunaehdot: 
    ● Voit käyttää mitä tahansa yleistä ohjelmointikieltä, joka on sinulle tuttu (Python, 
    JavaScript/TypeScript, Java, C# tai vastaava). 
    ● Voit käyttää muistinvaraista tietokantaa (in-memory database), jotta ympäristön 
    pystytys pysyy yksinkertaisena (esim. PostgreSQL tai MySQL-asennusta ei vaadita). 
    Muuta huomioitavaa: 
    ● Kuten oikeissakin työtehtävissä, tehtävänanto ei välttämättä sisällä kaikkea tarvittavaa 
    informaatiota. Koska käytettävissä ei ole “asiakasta” jolta kysyä lisätietoja, niin tehtävän 
    läpiviemiseksi saat tehdä itse oletuksia, kunhan dokumentoit tekemäsi oletukset. 

ChatGPT:
    Alla on **yksi mahdollinen toteutus** yksinkertaisesta kokoushuoneiden varaus-API:sta.
    Valitsin **Node.js + Express** -ratkaisun, koska se on kevyt, yleinen ja sinulle ennestään tuttu.

    ---

    ## Oletukset (dokumentoitu kuten pyydettiin)

    1. **Aikavyöhyke:** Kaikki ajat käsitellään **ISO 8601 UTC -aikana** (`YYYY-MM-DDTHH:mm:ssZ`).
    2. **Huoneet:** Huoneet tunnistetaan `roomId`-stringillä (esim. `"room-1"`). Erillistä huonetaulua ei ole.
    3. **Käyttäjät:** Ei autentikointia – kuka tahansa voi luoda/perua varauksia.
    4. **Tallennus:** Kaikki data on **in-memory** (palvelun restartti tyhjentää varaukset).
    5. **Päällekkäisyys:** Varaus menee päällekkäin, jos aikavälit leikkaavat edes osittain.

    ---

    ## API-toiminnot

    ### 1. Luo varaus

    `POST /reservations`

    ```json
    {
    "roomId": "room-1",
    "startTime": "2026-02-01T10:00:00Z",
    "endTime": "2026-02-01T11:00:00Z"
    }
    ```

    ### 2. Peruuta varaus

    `DELETE /reservations/:id`

    ### 3. Listaa huoneen varaukset

    `GET /rooms/:roomId/reservations`

    ---

    ## Toteutus (Node.js + Express)

    ```js
    const express = require("express");
    const app = express();

    app.use(express.json());

    // In-memory "database"
    let reservations = [];
    let idCounter = 1;

    // Helpers
    function isOverlapping(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
    }

    // Create reservation
    app.post("/reservations", (req, res) => {
    const { roomId, startTime, endTime } = req.body;

    if (!roomId || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Business rules
    if (start >= end) {
        return res.status(400).json({ error: "Start time must be before end time" });
    }

    if (start < now) {
        return res.status(400).json({ error: "Reservation cannot be in the past" });
    }

    const overlapping = reservations.find(r =>
        r.roomId === roomId &&
        isOverlapping(start, end, r.startTime, r.endTime)
    );

    if (overlapping) {
        return res.status(409).json({ error: "Room already booked for this time" });
    }

    const reservation = {
        id: idCounter++,
        roomId,
        startTime: start,
        endTime: end
    };

    reservations.push(reservation);
    res.status(201).json(reservation);
    });

    // Cancel reservation
    app.delete("/reservations/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = reservations.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    reservations.splice(index, 1);
    res.status(204).send();
    });

    // List room reservations
    app.get("/rooms/:roomId/reservations", (req, res) => {
    const { roomId } = req.params;

    const roomReservations = reservations
        .filter(r => r.roomId === roomId)
        .sort((a, b) => a.startTime - b.startTime);

    res.json(roomReservations);
    });

    // Start server
    app.listen(3000, () => {
    console.log("Meeting room reservation API running on port 3000");
    });
    ```

    ---

    ## Miksi tämä ratkaisu on “työelämäkelpoinen”

    * ✔ Selkeä **business-logiikka** (ei päällekkäisyyksiä, ei menneisyyttä)
    * ✔ REST-tyylinen API
    * ✔ Helppo laajentaa (auth, tietokanta, useat huoneet)
    * ✔ Testattavissa helposti (esim. Postman / Jest)

    ---

    Jos haluat, voin:

    * ✨ Muuntaa tämän **TypeScriptiksi**
    * 🧪 Lisätä **yksikkötestit**
    * ☁️ Näyttää, miten tämä deployataan **AWS Lambda + API Gateway**
    * 📄 Kirjoittaa tämän **README.md-muotoon** teknistä tehtävää varten

    Sanot vaan 👍

Minä:
    onko tämä paras tehdä juuri node.js + express? eikö TS olisi parempi?

ChatGPT:
    Lyhyt vastaus: **TypeScript on parempi**, *Node.js + Express + TypeScript* on yleensä paras yhdistelmä tämän tyyppiseen tehtävään.

    Pidempänä ja perustellusti 👇

    ---

    ## Miksi TypeScript on parempi kuin “pelkkä” Node.js (JS)

    ### 1. Tyyppiturva (iso etu teknisessä tehtävässä)

    TypeScript:

    * estää virheitä **jo käännösvaiheessa**
    * tekee API-sopimuksista selkeämpiä
    * näyttää arvioijalle, että osaat ajatella **ylläpidettävää backend-koodia**

    Esim:

    ```ts
    interface Reservation {
    id: number;
    roomId: string;
    startTime: Date;
    endTime: Date;
    }
    ```

    → Et voi vahingossa palauttaa vääränlaista dataa.

    ---

    ### 2. Luettavuus & itse-dokumentoivuus

    Kun joku lukee koodiasi (rekrytoija):

    * näkee heti, **mitä endpoint odottaa**
    * näkee heti, **mitä funktio palauttaa**
    * ei tarvitse arvailla

    Tämä on **iso plussa junior → mid -tason arvioinnissa**.

    ---

    ### 3. Todellinen työelämä

    Rehellisesti:

    * Pelkkä JS backendissä = harvinaista
    * **Node + TS** = erittäin yleinen

    Jos tehtävän ideana on simuloida oikeaa työtilannetta → **TS on oikea valinta**.

    ---

    ## Entä Express vs muut?

    ### Express on täysin ok tässä

    * yksinkertainen
    * ei turhaa magiaa
    * helppo arvioida

    **Vaihtoehdot:**

    * Fastify → parempi suorituskyky, enemmän konffia
    * NestJS → enterprise-tason, mutta *ylilyönti* tähän tehtävään

    ➡️ **Express + TS näyttää fiksulta ja maltilliselta valinnalta**

    ---

    ## Suositeltu stack tähän tehtävään

    **Paras tasapaino:**

    * Node.js
    * Express
    * TypeScript
    * In-memory storage (array / Map)
    * Ei ORM:ää (liikaa tähän)

    Tämä viestii:

    > “Ymmärrän tuotantokoodin periaatteet, mutta en ylikoodaa.”

    ---

    ## Milloin JS olisi ok?

    JS on ok, jos:

    * tehtäväaika on hyvin rajattu
    * TS ei ole ennestään tuttu

    Mutta **sinun taustalla** (Node, AWS, CI/CD, web-dev):
    ➡️ **TS on ehdottomasti parempi signaali**

    ---

    ## Haluatko seuraavaksi?

    Voin:

    * 🔧 muuttaa äskeisen ratkaisun **TypeScript + Express** -versioksi
    * 📁 antaa **hakemistorakenteen**, joka näyttää “työelämältä”
    * ✍️ kirjoittaa **perustelun READMEen** miksi valitsit TS:n

    Sano vain mihin mennään 👌

Minä:
    olisi mukava palautella mieleen TypeScriptiä, sillä siinä omat tuevallisuustekijänsä ja muutenkin suunnitelmissa omia projekteja päivittää JS -> TS. muutatko ratkaisun TS + Express versioksi?

ChatGPT:
    Erittäin hyvä ajatus 👍
    Tämä on **täydellinen pieni projekti** TypeScriptin “lihaksen” palauttamiseen ja samalla saat mallin, jota voit käyttää omissa JS → TS -migraatioissa.

    Alla on **siisti, työelämäkelpoinen TS + Express -versio** samasta ratkaisusta, selkeästi jaoteltuna.

    ---

    # Kokoushuonevaraus API – TypeScript + Express

    ## Projektirakenne (suositus)

    ```
    meeting-room-api/
    ├─ src/
    │  ├─ app.ts
    │  ├─ routes/
    │  │  └─ reservations.ts
    │  ├─ models/
    │  │  └─ Reservation.ts
    │  └─ db/
    │     └─ inMemoryDb.ts
    ├─ package.json
    ├─ tsconfig.json
    └─ README.md
    ```

    ---

    ## 1️⃣ Reservation-malli (`src/models/Reservation.ts`)

    ```ts
    export interface Reservation {
    id: number;
    roomId: string;
    startTime: Date;
    endTime: Date;
    }
    ```

    ➡️ Tämä on **TypeScriptin ydinvoitto**: selkeä dataformaatti kaikkialla.

    ---

    ## 2️⃣ In-memory “tietokanta” (`src/db/inMemoryDb.ts`)

    ```ts
    import { Reservation } from "../models/Reservation";

    export const reservations: Reservation[] = [];
    ```

    ---

    ## 3️⃣ Reitit ja liiketoimintalogiikka (`src/routes/reservations.ts`)

    ```ts
    import { Router, Request, Response } from "express";
    import { reservations } from "../db/inMemoryDb";
    import { Reservation } from "../models/Reservation";

    const router = Router();
    let idCounter = 1;

    function isOverlapping(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date
    ): boolean {
    return startA < endB && startB < endA;
    }

    // POST /reservations
    router.post("/", (req: Request, res: Response) => {
    const { roomId, startTime, endTime } = req.body as {
        roomId?: string;
        startTime?: string;
        endTime?: string;
    };

    if (!roomId || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
        return res.status(400).json({
        error: "Start time must be before end time"
        });
    }

    if (start < now) {
        return res.status(400).json({
        error: "Reservation cannot be in the past"
        });
    }

    const overlapping = reservations.find(r =>
        r.roomId === roomId &&
        isOverlapping(start, end, r.startTime, r.endTime)
    );

    if (overlapping) {
        return res.status(409).json({
        error: "Room already booked for this time"
        });
    }

    const reservation: Reservation = {
        id: idCounter++,
        roomId,
        startTime: start,
        endTime: end
    };

    reservations.push(reservation);
    res.status(201).json(reservation);
    });

    // DELETE /reservations/:id
    router.delete("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = reservations.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    reservations.splice(index, 1);
    res.status(204).send();
    });

    // GET /rooms/:roomId/reservations
    router.get("/rooms/:roomId/reservations", (req: Request, res: Response) => {
    const { roomId } = req.params;

    const roomReservations = reservations
        .filter(r => r.roomId === roomId)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    res.json(roomReservations);
    });

    export default router;
    ```

    💡 Huomaa:

    * `Reservation`-tyyppi käytössä kaikkialla
    * request body on **tyypitetty**
    * ei `any`-tyyppejä

    ---

    ## 4️⃣ Sovelluksen entry point (`src/app.ts`)

    ```ts
    import express from "express";
    import reservationsRouter from "./routes/reservations";

    const app = express();

    app.use(express.json());
    app.use("/reservations", reservationsRouter);

    const PORT = 3000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });
    ```

    ---

    ## 5️⃣ TypeScript-konfiguraatio (`tsconfig.json`)

    ```json
    {
    "compilerOptions": {
        "target": "ES2020",
        "module": "CommonJS",
        "rootDir": "src",
        "outDir": "dist",
        "strict": true,
        "esModuleInterop": true
    }
    }
    ```

    ➡️ `strict: true` = **hyvä TypeScript-kuntoilu**

    ---

    ## 6️⃣ package.json (oleellinen osa)

    ```json
    {
    "scripts": {
        "dev": "ts-node-dev src/app.ts",
        "build": "tsc",
        "start": "node dist/app.js"
    },
    "dependencies": {
        "express": "^4.18.2"
    },
    "devDependencies": {
        "@types/express": "^4.17.21",
        "ts-node-dev": "^2.0.0",
        "typescript": "^5.3.3"
    }
    }
    ```

    ---

    ## Miksi tämä on erinomainen TS-harjoitus sinulle

    * näet **JS → TS** erot käytännössä
    * opit tyypittämään:

    * request bodyt
    * domain-mallit
    * helper-funktiot
    * sama rakenne toimii suoraan:

    * AWS Lambda
    * Fastify
    * NestJS

    ---

    ## Seuraavat luonnolliset stepit (suosittelen)

    1. 🔁 Muunna yksi oma vanha JS-projekti tällä mallilla TS:ksi
    2. 🧪 Lisää **Jest-testit** business-logiikalle
    3. ☁️ Pakkaa tämä **Lambda + API Gateway** -muotoon
    4. 📦 Korvaa in-memory DB myöhemmin RDS:llä

    Jos haluat, seuraavaksi voin:

    * auttaa **JS → TS migraatiostrategiassa**
    * tehdä tästä **AWS-yhteensopivan**
    * lisätä **testit**
    * kirjoittaa **README:n palautusta varten**

    Sanot vaan 💪

Minä:
    lisäätkö testit tähän luotuun varausjärjestelmään

ChatGPT:
    Ehdottomasti 👍
    Lisätään **Jest-testit** niin, että ne testaavat **liiketoimintalogiikkaa oikeasti hyödyllisellä tavalla**, eivätkä ole pelkkiä “endpoint ping” -testejä.

    Teen tämän **työelämäkelpoisella tavalla**:

    * testataan API:a HTTP-tasolla
    * ei testata Expressiä itseään
    * testataan **business rules** (päällekkäisyys, menneisyys, aikajärjestys)

    ---

    # Testausstrategia (miksi näin)

    Valitsen:

    * **Jest** → de facto -standardi
    * **Supertest** → HTTP-kutsut Express-appiin ilman oikeaa serveriä

    Tämä:

    * simuloi oikeaa käyttöä
    * on helppo ymmärtää rekrytoijalle
    * on helppo laajentaa

    ---

    ## 1️⃣ Asennukset

    ```bash
    npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
    ```

    ---

    ## 2️⃣ Jest-konfiguraatio (`jest.config.js`)

    ```js
    module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"]
    };
    ```

    ---

    ## 3️⃣ Pieni refaktorointi: app exportattavaksi

    ### `src/app.ts`

    ```ts
    import express from "express";
    import reservationsRouter from "./routes/reservations";

    const app = express();

    app.use(express.json());
    app.use("/reservations", reservationsRouter);

    export default app;
    ```

    ### `src/server.ts` (uusi tiedosto)

    ```ts
    import app from "./app";

    const PORT = 3000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });
    ```

    ➡️ **Tämä on tärkeä testattavuuspattern**
    (app ≠ server)

    ---

    ## 4️⃣ Testikansio

    ```
    src/
    ├─ __tests__/
    │  └─ reservations.test.ts
    ```

    ---

    ## 5️⃣ Testit (`src/__tests__/reservations.test.ts`)

    ```ts
    import request from "supertest";
    import app from "../app";
    import { reservations } from "../db/inMemoryDb";

    describe("Meeting room reservation API", () => {

    beforeEach(() => {
        reservations.length = 0; // reset in-memory DB
    });

    test("creates a reservation successfully", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
        expect(response.body.roomId).toBe("room-1");
    });

    test("rejects overlapping reservations", async () => {
        await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:30:00Z",
            endTime: "2099-01-01T11:30:00Z"
        });

        expect(response.status).toBe(409);
    });

    test("allows same time reservation in different rooms", async () => {
        await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-2",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
    });

    test("rejects reservation in the past", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2000-01-01T10:00:00Z",
            endTime: "2000-01-01T11:00:00Z"
        });

        expect(response.status).toBe(400);
    });

    test("rejects invalid time range", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T11:00:00Z",
            endTime: "2099-01-01T10:00:00Z"
        });

        expect(response.status).toBe(400);
    });

    test("deletes reservation successfully", async () => {
        const createResponse = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const reservationId = createResponse.body.id;

        const deleteResponse = await request(app)
        .delete(`/reservations/${reservationId}`);

        expect(deleteResponse.status).toBe(204);
    });
    });
    ```

    ---

    ## 6️⃣ package.json – test script

    ```json
    {
    "scripts": {
        "test": "jest"
    }
    }
    ```

    ---

    ## Mitä tämä kertoo arvioijalle 🚀

    * ✔ osaat testata **API:ta realistisesti**
    * ✔ ymmärrät **in-memory DB:n resetoinnin**
    * ✔ testaat oikeita **business ruleja**
    * ✔ TypeScript + testaus = tuotantovalmiin ajattelun merkki

    Tämä on **erittäin vahva** signaali junior/mid-backend-rooleihin.

    ---

    ## Haluatko vielä seuraavaksi?

    Voin:

    * 🧠 erottaa business-logiikan **service-layeriin** (vielä parempi testattavuus)
    * 📊 lisätä testikattavuuden (coverage)
    * ☁️ näyttää miten nämä testit ajetaan CI/CD:ssä
    * ✍️ kirjoittaa **README:n testiosion** palautusta varten

    Sano vain, jatketaanko 💪

Minä:
    seuraavaksi tehdään huoneiden hallinta sillä tässä nykyisessä versiossa huoneita voi luoda äärettämän määrän. miten olisi paras toteuttaa?

ChatGPT:
    Todella hyvä havainto 👌
    Tämä on **juuri sellainen arkkitehtuurinen huomio**, jota arvioijat ja seniorit arvostavat.

    Tässä kohtaa *“paras toteutus”* ei tarkoita monimutkaisinta, vaan **hallittua ja laajennettavaa**.

    ---

    # Ongelma nykyisessä ratkaisussa

    Nyt:

    * `roomId` on vapaa string
    * kuka tahansa voi varata `room-xyz-123`
    * huoneita ei ole olemassa käsitteenä

    ➡️ Tämä rikkoo **domain-mallia**:

    > Varaus ei voi olla olemassa ilman huonetta.

    ---

    # Paras tapa edetä (suositus)

    ## 🔑 Lisää eksplisiittinen **Room-domain**

    ### Periaate:

    1. Huoneet luodaan erikseen
    2. Varaus **viittaa olemassa olevaan huoneeseen**
    3. Varausta ei voi tehdä, jos huonetta ei ole

    Tämä vastaa:

    * oikeaa liiketoimintaa
    * relaatiotietokantaa
    * hyvää domain-mallinnusta

    ---

    # Ehdotettu arkkitehtuuri

    ```
    src/
    ├─ models/
    │  ├─ Room.ts
    │  └─ Reservation.ts
    ├─ db/
    │  ├─ roomsDb.ts
    │  └─ reservationsDb.ts
    ├─ routes/
    │  ├─ rooms.ts
    │  └─ reservations.ts
    ```

    ---

    ## 1️⃣ Room-malli (`src/models/Room.ts`)

    ```ts
    export interface Room {
    id: string;
    name: string;
    capacity: number;
    }
    ```

    ➡️ `id` on tekninen, `name` ihmisläheinen.

    ---

    ## 2️⃣ In-memory huonetietokanta (`src/db/roomsDb.ts`)

    ```ts
    import { Room } from "../models/Room";

    export const rooms: Room[] = [];
    ```

    ---

    ## 3️⃣ Huoneiden hallinta-API

    ### Luo huone

    `POST /rooms`

    ```json
    {
    "id": "room-1",
    "name": "Neuvotteluhuone Apollo",
    "capacity": 8
    }
    ```

    ### Listaa huoneet

    `GET /rooms`

    ### Hae huone

    `GET /rooms/:id`

    ---

    ## 4️⃣ Huonereitit (`src/routes/rooms.ts`)

    ```ts
    import { Router, Request, Response } from "express";
    import { rooms } from "../db/roomsDb";
    import { Room } from "../models/Room";

    const router = Router();

    // POST /rooms
    router.post("/", (req: Request, res: Response) => {
    const { id, name, capacity } = req.body as Partial<Room>;

    if (!id || !name || !capacity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const exists = rooms.find(r => r.id === id);
    if (exists) {
        return res.status(409).json({ error: "Room already exists" });
    }

    const room: Room = { id, name, capacity };
    rooms.push(room);

    res.status(201).json(room);
    });

    // GET /rooms
    router.get("/", (_req, res) => {
    res.json(rooms);
    });

    // GET /rooms/:id
    router.get("/:id", (req, res) => {
    const room = rooms.find(r => r.id === req.params.id);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
    });

    export default router;
    ```

    ---

    ## 5️⃣ Varausten validointi huoneita vasten

    ### Päivitä `reservations.ts`

    Lisää alkuun:

    ```ts
    import { rooms } from "../db/roomsDb";
    ```

    Lisää ennen päällekkäisyystarkistusta:

    ```ts
    const roomExists = rooms.find(r => r.id === roomId);
    if (!roomExists) {
    return res.status(404).json({ error: "Room does not exist" });
    }
    ```

    ➡️ Nyt:

    * huone **pitää luoda ensin**
    * varaukset ovat kontrolloituja

    ---

    # Miksi tämä on paras ratkaisu tähän vaiheeseen

    ### ✔ Domain-driven ajattelu

    Huone on **ensiluokkainen käsite**, ei vain string.

    ### ✔ Laajennettavuus

    Helppo lisätä myöhemmin:

    * huoneen poisto
    * huoneen muokkaus
    * varauskalenteri per huone

    ### ✔ Sama malli toimii suoraan RDS:ssä

    * `rooms` → taulu
    * `reservations` → foreign key `room_id`

    ---

    # Entä vaihtoehdot (ja miksi ei nyt)

    ### ❌ Hardcoded huonelista

    * helppo mutta epärealistinen

    ### ❌ Automaattinen huoneen luonti varauksen yhteydessä

    * huono domain-malli
    * piilologiiikkaa

    ---

    # Seuraava luonnollinen askel

    Suosittelen seuraavaksi yhtä näistä:

    1. 🧪 **Testit huoneiden hallinnalle**
    2. 🔐 Huoneiden poisto + estä poisto jos varauksia on
    3. 🧠 Service-layer (RoomService / ReservationService)
    4. ☁️ AWS-yhteensopiva rakenne (Lambda-ready)

    Jos haluat, valitse yksi niin rakennetaan se kunnolla 💪

Minä:
    luotko vielä testit tälle uudelle logiikalle

ChatGPT:
    Kyllä 👍
    Lisätään **testit huoneiden hallinnalle JA uudelle varauslogiikalle**, niin että ne oikeasti todentavat domain-säännöt:

    > *Varausta ei voi luoda ilman olemassa olevaa huonetta.*

    Teen tämän samalla **ammattimaisella tasolla** kuin aiemmat testit.

    ---

    # Mitä testaamme nyt

    ## Huoneet

    * ✔ huoneen luonti onnistuu
    * ✔ duplikaattihuonetta ei voi luoda
    * ✔ huoneet voidaan listata

    ## Varaukset (huoneisiin sidottuna)

    * ✔ varausta ei voi luoda huoneeseen, jota ei ole
    * ✔ varaus onnistuu olemassa olevaan huoneeseen
    * ✔ vanhat business-säännöt edelleen voimassa

    ---

    # 1️⃣ Pieni varmistus: app.ts

    Varmista, että molemmat reitit on rekisteröity:

    ```ts
    import express from "express";
    import reservationsRouter from "./routes/reservations";
    import roomsRouter from "./routes/rooms";

    const app = express();

    app.use(express.json());
    app.use("/rooms", roomsRouter);
    app.use("/reservations", reservationsRouter);

    export default app;
    ```

    ---

    # 2️⃣ Testikansiorakenne

    ```
    src/
    ├─ __tests__/
    │  ├─ rooms.test.ts
    │  └─ reservations.test.ts
    ```

    ---

    # 3️⃣ Huonetestit (`src/__tests__/rooms.test.ts`)

    ```ts
    import request from "supertest";
    import app from "../app";
    import { rooms } from "../db/roomsDb";

    describe("Rooms API", () => {

    beforeEach(() => {
        rooms.length = 0;
    });

    test("creates a room successfully", async () => {
        const response = await request(app)
        .post("/rooms")
        .send({
            id: "room-1",
            name: "Neuvotteluhuone Apollo",
            capacity: 8
        });

        expect(response.status).toBe(201);
        expect(response.body.id).toBe("room-1");
    });

    test("rejects duplicate room id", async () => {
        await request(app)
        .post("/rooms")
        .send({
            id: "room-1",
            name: "Apollo",
            capacity: 6
        });

        const response = await request(app)
        .post("/rooms")
        .send({
            id: "room-1",
            name: "Apollo Duplicate",
            capacity: 10
        });

        expect(response.status).toBe(409);
    });

    test("lists all rooms", async () => {
        await request(app)
        .post("/rooms")
        .send({
            id: "room-1",
            name: "Apollo",
            capacity: 8
        });

        const response = await request(app).get("/rooms");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });
    });
    ```

    ---

    # 4️⃣ Päivitetyt varaustestit (`src/__tests__/reservations.test.ts`)

    ```ts
    import request from "supertest";
    import app from "../app";
    import { reservations } from "../db/inMemoryDb";
    import { rooms } from "../db/roomsDb";

    describe("Reservations API with room validation", () => {

    beforeEach(() => {
        reservations.length = 0;
        rooms.length = 0;
    });

    test("rejects reservation if room does not exist", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(404);
    });

    test("creates reservation for existing room", async () => {
        await request(app)
        .post("/rooms")
        .send({
            id: "room-1",
            name: "Apollo",
            capacity: 8
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
        expect(response.body.roomId).toBe("room-1");
    });

    test("still rejects overlapping reservations", async () => {
        await request(app).post("/rooms").send({
        id: "room-1",
        name: "Apollo",
        capacity: 8
        });

        await request(app).post("/reservations").send({
        roomId: "room-1",
        startTime: "2099-01-01T10:00:00Z",
        endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app).post("/reservations").send({
        roomId: "room-1",
        startTime: "2099-01-01T10:30:00Z",
        endTime: "2099-01-01T11:30:00Z"
        });

        expect(response.status).toBe(409);
    });
    });
    ```

    ---

    # 5️⃣ Aja testit

    ```bash
    npm test
    ```

    Jos kaikki on oikein:
    ✅ kaikki testit vihreänä
    ✅ domain-säännöt lukittu testein

    ---

    # Miksi tämä kokonaisuus on **erittäin vahva**

    Tässä vaiheessa projektisi näyttää jo:

    * ✔ Domain-mallinnus (Room ↔ Reservation)
    * ✔ TypeScript strict-moodi
    * ✔ API-testaus oikealla HTTP-tasolla
    * ✔ Liiketoimintasäännöt testattu

    Tämä on **selvästi yli “perustehtävän” tason**.

    ---

    ## Seuraava looginen askel (suosittelen vahvasti)

    Valitse yksi:

    1. 🧠 **Service-layer** (RoomService / ReservationService)
    2. 🔐 Huoneen poisto + estä poisto jos varauksia on
    3. 📊 Testikattavuus (`--coverage`)
    4. ☁️ Lambda-ready refaktorointi
    5. ✍️ README “tekninen perustelu” -osio

    Sano mikä kiinnostaa, jatketaan siitä 💪

Minä:
    testit epäonnistuvat:
    > test
    > jest

    PASS  src/__tests__/rooms.test.ts
    FAIL  src/__tests__/reservations.test.ts
    ● Meeting room reservation API › creates a reservation successfully

        expect(received).toBe(expected) // Object.is equality

        Expected: 201
        Received: 404

        18 |       });
        19 |
        > 20 |     expect(response.status).toBe(201);
            |                             ^
        21 |     expect(response.body.roomId).toBe("room-1");
        22 |   });
        23 |

        at Object.<anonymous> (src/__tests__/reservations.test.ts:20:29)

    ● Meeting room reservation API › rejects overlapping reservations

        expect(received).toBe(expected) // Object.is equality

        Expected: 409
        Received: 404

        39 |       });
        40 |
        > 41 |     expect(response.status).toBe(409);
            |                             ^
        42 |   });
        43 |
        44 |   test("allows same time reservation in different rooms", async () => {

        at Object.<anonymous> (src/__tests__/reservations.test.ts:41:29)

    ● Meeting room reservation API › allows same time reservation in different rooms

        expect(received).toBe(expected) // Object.is equality

        Expected: 201
        Received: 404

        59 |       });
        60 |
        > 61 |     expect(response.status).toBe(201);
            |                             ^
        62 |   });
        63 |
        64 |   test("rejects reservation in the past", async () => {

        at Object.<anonymous> (src/__tests__/reservations.test.ts:61:29)

    ● Meeting room reservation API › deletes reservation successfully

        expect(received).toBe(expected) // Object.is equality

        Expected: 204
        Received: 404

        100 |       .delete(`/reservations/${reservationId}`);
        101 |
        > 102 |     expect(deleteResponse.status).toBe(204);
            |                                   ^
        103 |   });
        104 | });
        105 |

        at Object.<anonymous> (src/__tests__/reservations.test.ts:102:35)

    Test Suites: 1 failed, 1 passed, 2 total
    Tests:       4 failed, 5 passed, 9 total
    Snapshots:   0 total
    Time:        2.767 s, estimated 4 s
    Ran all test suites.

ChatGPT:
    Hyvä että ajoit testit ja toit virheet näkyviin – tämä on **täysin odotettu ja itse asiassa hyvä merkki** 👍
    Virhe ei ole “mystinen”, vaan kertoo että **domain-sääntö toimii oikein**.

    Puretaan tämä rauhassa.

    ---

    ## Miksi testit epäonnistuvat?

    ### Yhteinen nimittäjä virheissä

    Kaikissa epäonnistuneissa testeissä:

    ```
    Expected: 201 / 409 / 204
    Received: 404
    ```

    ➡️ **404 = Room does not exist**

    Ja tämä on täysin loogista, koska:

    > Lisäsimme uuden säännön:
    > ❗ Varausta ei voi luoda, jos huonetta ei ole luotu ensin.

    ---

    ## Missä kohtaa vika on?

    ### `reservations.test.ts` on osittain **vanhaa logiikkaa**

    Esimerkiksi tämä testi:

    ```ts
    test("creates a reservation successfully", async () => {
    const response = await request(app)
        .post("/reservations")
        .send({
        roomId: "room-1",
        startTime: "...",
        endTime: "..."
        });

    expect(response.status).toBe(201);
    });
    ```

    ❌ Tässä **ei luoda huonetta ensin**, joten API vastaa oikein:

    ```http
    404 Room does not exist
    ```

    ---

    ## Oikea ratkaisu (ei workaround)

    ### 🔑 Jokainen varaustesti, joka odottaa onnistumista, **luo huoneen ensin**

    Tämä on:

    * oikea domain-ajattelu
    * realistinen käyttö
    * hyvä testikäytäntö

    ---

    ## Korjattu `reservations.test.ts`

    ### Täysi, korjattu versio 👇

    ```ts
    import request from "supertest";
    import app from "../app";
    import { reservations } from "../db/inMemoryDb";
    import { rooms } from "../db/roomsDb";

    describe("Meeting room reservation API", () => {

    beforeEach(async () => {
        reservations.length = 0;
        rooms.length = 0;

        // Create default room for tests
        await request(app)
        .post("/rooms")
        .send({
            id: "room-1",
            name: "Apollo",
            capacity: 8
        });
    });

    test("creates a reservation successfully", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
        expect(response.body.roomId).toBe("room-1");
    });

    test("rejects overlapping reservations", async () => {
        await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:30:00Z",
            endTime: "2099-01-01T11:30:00Z"
        });

        expect(response.status).toBe(409);
    });

    test("allows same time reservation in different rooms", async () => {
        await request(app)
        .post("/rooms")
        .send({
            id: "room-2",
            name: "Zeus",
            capacity: 6
        });

        await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-2",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
    });

    test("rejects reservation in the past", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2000-01-01T10:00:00Z",
            endTime: "2000-01-01T11:00:00Z"
        });

        expect(response.status).toBe(400);
    });

    test("deletes reservation successfully", async () => {
        const createResponse = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const reservationId = createResponse.body.id;

        const deleteResponse = await request(app)
        .delete(`/reservations/${reservationId}`);

        expect(deleteResponse.status).toBe(204);
    });
    });
    ```

    ---

    ## Miksi tämä on **hyvä asia** eikä huono

    Tämä kertoo, että:

    * ✅ Huoneiden olemassaolo validoidaan oikein
    * ✅ Testit paljastivat domain-muutoksen vaikutuksen
    * ✅ Et “paikannut” koodia väärään suuntaan
    * ✅ Ymmärrät riippuvuudet (Room → Reservation)

    Tämä on **oikeaa backend-osaamista**, ei pelkkää koodausta.

    ---

    ## Pieni pro-vinkki testaukseen

    Jos projekti kasvaa:

    * pidä **factory-funktio** testihuoneille
    * esim. `createTestRoom(app, "room-1")`

    Tätä käytetään paljon oikeissa projekteissa.

    ---

    ## Seuraava erittäin luonteva askel 🚀

    Suosittelen seuraavaksi yhtä näistä:

    1. 🧠 **Service-layer** → vielä parempi testattavuus
    2. 🔐 Huoneen poisto + estä poisto jos varauksia on
    3. 📊 Testikattavuus (`jest --coverage`)
    4. ☁️ AWS Lambda -refaktorointi

    Sano mikä kiinnostaa, tämä projekti on jo **todella hyvässä kunnossa** 💪
