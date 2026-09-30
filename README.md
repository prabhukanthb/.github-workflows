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

Without `MONGODB_URI`, profiles stay in `data/db.json` on this computer. Production uses MongoDB.

## Launch on Vercel

`telugukalyanamala.com` and `telugukalyanamala.org` are one site. `www` and `.org` redirect to `https://telugukalyanamala.com`. Do not add `newkalyanamala.com` or `newkalyanamala.org` to this Vercel project, and do not reuse that site’s MongoDB URI or Cloudinary cloud.

1. In MongoDB Atlas, create a database user and a database named `telugu-kalyanamala`. The connection string must end with `/telugu-kalyanamala`.
2. In Cloudinary, create a separate cloud for this site. Photos are stored only in the folder `telugu-kalyanamala`.
3. In Vercel, create a new project from this GitHub repository. Do not use the New Kalyanamala project.
4. Set these environment variables on that project:

| Name | Value |
| --- | --- |
| `MONGODB_URI` | `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/telugu-kalyanamala` |
| `CLOUDINARY_CLOUD_NAME` | the new cloud name |
| `CLOUDINARY_API_KEY` | the new API key |
| `CLOUDINARY_API_SECRET` | the new API secret |
| `JWT_SECRET` | a long random string from `openssl rand -hex 32` |

5. Deploy. The build command is `npm run build` and the output folder is `dist`.
6. In the Vercel project, add the domains `telugukalyanamala.com`, `www.telugukalyanamala.com`, `telugukalyanamala.org`, and `www.telugukalyanamala.org`. At the registrar, set the DNS records Vercel shows. Do not point these names at the New Kalyanamala project.
7. Open `https://telugukalyanamala.com/api/health`. It should report `storage` as `mongodb:telugu-kalyanamala` and `photos` as `cloudinary:telugu-kalyanamala`.

The first deploy creates the office login `admin@example.com` / `Office@12345` and the demo bride and groom. Change the office password and remove the demo profiles before families use the site. Never set `RESET_DB` on Vercel after real profiles exist.

## Demo accounts

These accounts are created the first time the API starts.

| Who | Email | Password |
| --- | --- | --- |
| Vijayawada office | admin@example.com | Office@12345 |
| Bride (Anitha) | anitha.demo@example.com | Member@12345 |
| Groom (Suresh) | suresh.demo@example.com | Member@12345 |

A bride sees older grooms. A groom sees brides of the same age or younger. Office staff do not get a member profile. After login they see **Create profile**, which opens the biodata form. On the Office page, **Add an office login** creates another admin or a subadmin. Leave the password empty and it becomes the first 4 letters of the first name, `@`, and the last 4 digits of the mobile.

Reset the demo data with `npm run seed`.
