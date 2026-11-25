# Rishi Raj — Interactive Neon Bike Arena Portfolio

An interactive, dark-fantasy gaming portfolio and Game Hub built by **Rishi Raj (RRSDCE Begusarai, BEU)**.

## Features
- **Interactive Hover & Smash Mechanic**: Hover or click any of the 4 glowing 3D granite boulders (**About Us**, **Projects**, **CODER ARMY**, **Contact**) to launch the neon Rider along a curved energy path and shatter the boulder with textured rock-shard physics.
- **Procedural 3D Graphics & Audio**: High-DPI HTML5 Canvas waterfall, reflective lake, procedural granite boulders, and synthesized Web Audio API sound effects (rev + shatter).
- **Coder Army Alliance Hub**: Dedicated portal to link and showcase games built by friends.

## Project Structure
```text
├── index.html   # Main HTML structure & SVG assets
├── style.css    # Arena styling, animations, and responsive layout
├── script.js    # Procedural rock generator, physics engine & PORTFOLIO_CONFIG
└── README.md    # Setup & customization guide
```

## How to Customize Your Links & Friends' Games
Open `script.js` and edit the `PORTFOLIO_CONFIG` object at the very top of the file:
- `developer`: Update your GitHub URL, email, Discord link, and skills.
- `projects`: Add your live demo and GitHub repository links.
- `coderArmyFriends`: Add your friends' game titles, descriptions, and URLs.

## How to Deploy on GitHub Pages
1. Create a new public repository on GitHub (e.g., `rishi-portfolio`).
2. Upload all files from this ZIP (`index.html`, `style.css`, `script.js`, `README.md`) to the root of the repository.
3. Go to **Settings → Pages**.
4. Under **Build and deployment → Source**, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)` folder, then click **Save**.
6. Your live website will be available at `https://<your-username>.github.io/<repo-name>/` in 1–2 minutes.
