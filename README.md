# Telugu Kalyanamala

Matrimony site for Mala families, run by Kalyanamala Seva Samstha from its Vijayawada office. The home page carries the line “Introduction is Ours - Inspection is yours.” Families register, complete a biodata, and search brides and grooms. Phone numbers stay hidden until both families agree through the office.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API listens on port 4000.

```bash
npm run build
npm start
```

`npm start` serves the built site and the API together on port 4000.

## Demo accounts

These accounts are created the first time the API starts.

| Who | Email | Password |
| --- | --- | --- |
| Vijayawada office | admin@example.com | Office@12345 |
| Bride (Anitha) | anitha.demo@example.com | Member@12345 |
| Groom (Suresh) | suresh.demo@example.com | Member@12345 |

A bride sees older grooms. A groom sees brides of the same age or younger. Office staff do not get a member profile. After login they see **Create profile**, which opens the biodata form.

Reset the demo data with `npm run seed`.
