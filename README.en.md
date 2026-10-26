# BlocStudio

*[Version française](README.md)*

**Block programming, in English or French, to build real Windows applications and games.**

Try BlocStudio online: **https://ebarnabe.github.io/BlocStudio/**

BlocStudio mixes two ideas:
- **draw your window** as in Visual Basic: put down buttons, text boxes, images, sprites…;
- **write what it does with blocks** that snap together, as in Scratch: “when Button1 is clicked”, “make Hero jump”…

The result can be exported as a **web page** or a **Windows application (.exe)** that you can give to someone else.

![The “Platforms” example running, on top of its blocks](docs/capture.png)

## Getting started

Nothing to install:

- **`BlocStudio.exe`** (Windows 10 and 11): the editor in its own window. It must stay next to `index.html`. For the desktop, make a shortcut to it.
- or **`index.html`**, opened in Edge or Chrome.

Then **📚 Examples** to open a ready-made program, or **📄 New** to start from an empty window.

The editor follows the language of the computer; the **🌐** menu switches between English and French. A project made in one language works in the other.

The current project is kept automatically. **💾 Save** puts it in a `.bstudio` file, which **📂 Open** reads back.

## What you can do

### Windows and 38 controls

| Theme | Controls |
|---|---|
| ✏️ Text | Label, Link, Password, Text box |
| 🔘 Buttons and choices | Button, Radio button, Calendar, Check box, Slider, Switch, Drop-down list, Color, date, time and number pickers, List box |
| 📊 Data | Tree view, Progress bar, Database, Chart, Clock, Table |
| 🖼️ Images and drawing | Shape, Image, Sprite (with its pixel drawing editor), Drawing area |
| 🎬 Sounds, videos and web | Camera, Web browser, Sound, Video |
| 🧱 Layout | Status bar, Toolbar, Frame, Context menu, Tabs, Scrolling panel |
| ⚙️ Tools | Open / Save a file, Timer |

A program can have **several windows**, **menus**, **resizable** windows whose controls follow their anchoring, and go **full screen**.

### More than 200 blocks

- **Events**: clicks, keys, mouse, gamepad, timers, messages between scripts.
- **Movement and games**: move, bounce, pixel-perfect collisions, **gravity and jumping** with “solid” floors and walls, clones, costumes and animations, **scrolling background**, score and lives.
- **Gamepad**: buttons and sticks. The D-pad also acts as the keyboard arrows, so games made for the keyboard can be played with a gamepad.
- **Sounds**: 8-bit sounds and music (with a studio to compose them), speech, **microphone**.
- **Data**: lists, **dictionaries**, memory that is kept from one run to the next, **CSV and Excel (.xlsx)** files to open and save.
- **Maths and text**: random numbers, numbers written in the language of the editor (“1,234.50”), unit conversions, **dates**.
- **Internet and Windows**: weather, data from a web service (JSON), turned into lists or table rows with a single block; notifications, clipboard, printing.

Every block has a tooltip that explains what it is for. The **</> Show the code** button shows the JavaScript produced by the blocks.

### Finding your mistakes

The **Slow** and **Step by step** modes light up each block as it runs, and **Variables** shows their values. An error is explained in plain words, and **🧩 Show the block** points to the faulty block.

### Importing and exporting data

A Table, a Database, a list or the suggestions of a Text box can be filled from a **CSV or Excel file**, from their properties (**📥 Import…**). A preview window lets you choose the sheet, the rows and the columns to keep. The data is stored in the project and goes along with exported programs. It can also be saved to Excel or CSV (**📤**).

The Table stays smooth with tens of thousands of rows, for example the 35,000 towns of France.

### 21 examples

- **🌱 Getting started**: Hello, Sign-up form, Maths quiz, Countdown, Several windows.
- **🗂️ Applications**: To-do list, Secret diary, Notepad, Chat, Weather, Towns of France, Address book, My library.
- **🎮 Games**: Bouncing ball, Catch the coin, Meteor shower, Ghost hunt, Brick breaker, Platforms.
- **🎨 Images, sounds and camera**: Mini-Paint, Photo booth.

They are all commented with “💬” blocks that explain how they work. Their texts are translated; the names of their controls and variables stay in French.

## Exporting

**📦 Export** offers:

- **Web page (.html)**: a single file, which opens in any browser.
- **Windows application (.exe)**: a single file, to double-click. It uses WebView2, the Edge engine that comes with Windows 10 and 11: nothing else to install. How the launcher works is described (in French) in [`lanceur/LISEZMOI.md`](lanceur/LISEZMOI.md).

An exported program keeps the language of the editor it was exported from.

## How the code is organized

The code is written in French (names, comments); every text shown on screen goes through `T()`, which looks it up in the English dictionary.

| File | Role |
|---|---|
| `index.html`, `css/style.css` | The editor page |
| `js/app.js` | The editor: window designer, properties, files, running, export |
| `js/blocks.js` | The blocks (shape, tooltip, JavaScript produced) and the toolbox |
| `js/runtime.js` | The engine that runs programs, in the editor as well as in exports |
| `js/exemples.js` | The examples of the gallery |
| `js/editeur-sprite.js`, `js/studio-musique.js`, `js/emojis.js` | The sprite editor, the 8-bit music studio, the emoji picker |
| `js/langues.js`, `js/langues/en.js` | Languages: `T()`, the 🌐 menu, and the English translations |
| `lanceur/` | `BlocStudio.exe` and the launcher of exported applications (C#, WebView2) |
| `lib/blockly/` | [Blockly](https://developers.google.com/blockly), Google's block library |
| `tests/` | The automated tests |

There is no build step: the files are used as they are. Only `BlocStudio.exe` and the launcher are recompiled, and only if `lanceur/Lanceur.cs` or `lanceur/Studio.cs` changes:

```
powershell -ExecutionPolicy Bypass -File lanceur\construire.ps1
```

The C# compiler it uses is part of Windows.

## Tests

```
powershell -ExecutionPolicy Bypass -File tests\verifier.ps1
```

The script opens the editor in Chrome or Edge, without a window, then checks:
- the engine (gravity, score, dates, dictionaries, gamepad…);
- each example: it opens, its blocks are shown and it runs without errors;
- each `.bstudio` project placed in `tests\`;
- the editor in English, an exported program in English, and every example in English.

It answers “Tout est bon” (exit code 0) or lists the failures (code 1).

## License

BlocStudio is under the [MIT license](LICENSE): anyone can use, modify and redistribute it freely, as long as the license notice is kept.

The programs you make with BlocStudio are yours. Once exported, they contain the BlocStudio engine (MIT) and, for an .exe, Microsoft's WebView2 DLLs.

## Software and services used

- [Blockly](https://github.com/google/blockly) 11.2.1: Google, Apache 2.0 license (`lib/blockly/LICENSE`).
- The [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) SDK 1.0.2903.40: Microsoft, BSD-style license (`lanceur/sdk/LICENSE.txt`).
- [Open-Meteo](https://open-meteo.com) for the Weather blocks: data under the CC BY 4.0 license.
- [geo.api.gouv.fr](https://geo.api.gouv.fr/decoupage-administratif) for the Towns of France example: data under the Licence Ouverte 2.0.

The details, with what each one provides, are in [LOGICIELS-TIERS.md](LOGICIELS-TIERS.md) (in French).
