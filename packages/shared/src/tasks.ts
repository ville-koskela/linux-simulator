import type { Task } from "./types/tasks.js";

/**
 * Central definition of all learnable tasks.
 * Conditions are evaluated client-side; completions are persisted via the backend.
 */
export const TASKS: readonly Task[] = [
  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  {
    key: "first_pwd",
    category: "navigation",
    xpReward: 10,
    requiredLevel: 1,
    condition: { type: "run_command", command: "pwd" },
    translations: {
      en: {
        title: "Where am I?",
        description: "Run the `pwd` command to print your current directory.",
      },
      fi: {
        title: "Missä olen?",
        description: "Suorita `pwd`-komento tulostaaksesi nykyisen kansion.",
      },
    },
  },
  {
    key: "first_ls",
    category: "navigation",
    xpReward: 10,
    requiredLevel: 1,
    condition: { type: "run_command", command: "ls" },
    translations: {
      en: { title: "Look Around", description: "Run `ls` to list files in the current directory." },
      fi: { title: "Katsele ympärille", description: "Suorita `ls` listataksesi tiedostot." },
    },
  },
  {
    key: "first_cd",
    category: "navigation",
    xpReward: 15,
    requiredLevel: 1,
    condition: { type: "run_command", command: "cd" },
    translations: {
      en: { title: "First Steps", description: "Use `cd` to change to a different directory." },
      fi: { title: "Ensiaskeleet", description: "Käytä `cd`-komentoa vaihtaaksesi kansiota." },
    },
  },
  {
    key: "ls_5_times",
    category: "navigation",
    xpReward: 25,
    requiredLevel: 1,
    condition: { type: "run_command_n_times", command: "ls", n: 5 },
    translations: {
      en: {
        title: "Directory Detective",
        description: "Run `ls` 5 times to explore different directories.",
      },
      fi: { title: "Kansiometsästäjä", description: "Suorita `ls` 5 kertaa." },
    },
  },
  {
    key: "navigate_home",
    category: "navigation",
    xpReward: 20,
    requiredLevel: 1,
    condition: { type: "run_command_with_args", command: "cd", args: ["~"] },
    translations: {
      en: {
        title: "There's No Place Like Home",
        description: "Run `cd ~` to go to your home directory.",
      },
      fi: { title: "Koti on paras", description: "Suorita `cd ~` siirtyäksesi kotikansioon." },
    },
  },
  {
    key: "navigate_root",
    category: "exploration",
    xpReward: 20,
    requiredLevel: 1,
    condition: { type: "navigate_to_path", path: "/" },
    translations: {
      en: { title: "Root Explorer", description: "Navigate to the root directory `/`." },
      fi: { title: "Juuritutkija", description: "Siirry juurikansioon `/`." },
    },
  },
  {
    key: "first_cat",
    category: "exploration",
    xpReward: 15,
    requiredLevel: 1,
    condition: { type: "run_command", command: "cat" },
    translations: {
      en: { title: "Read a File", description: "Use `cat` to view the contents of a file." },
      fi: {
        title: "Lue tiedosto",
        description: "Käytä `cat`-komentoa tiedoston sisällön näyttämiseen.",
      },
    },
  },
  {
    key: "read_welcome",
    category: "exploration",
    xpReward: 20,
    requiredLevel: 1,
    condition: { type: "run_command_with_args", command: "cat", args: ["welcome.txt"] },
    translations: {
      en: { title: "Welcome Reader", description: "Read your `welcome.txt` file with `cat`." },
      fi: {
        title: "Tervetuloa-lukija",
        description: "Lue `welcome.txt`-tiedostosi `cat`-komennolla.",
      },
    },
  },
  // -------------------------------------------------------------------------
  // File management
  // -------------------------------------------------------------------------
  {
    key: "first_touch",
    category: "files",
    xpReward: 25,
    requiredLevel: 2,
    condition: { type: "create_file" },
    translations: {
      en: { title: "Brand New File", description: "Create a new empty file using `touch`." },
      fi: { title: "Uusi tiedosto", description: "Luo uusi tyhjä tiedosto `touch`-komennolla." },
    },
  },
  {
    key: "first_mkdir",
    category: "files",
    xpReward: 25,
    requiredLevel: 2,
    condition: { type: "create_directory" },
    translations: {
      en: { title: "Build a Directory", description: "Create a new directory using `mkdir`." },
      fi: { title: "Luo kansio", description: "Luo uusi kansio `mkdir`-komennolla." },
    },
  },
  {
    key: "first_rm",
    category: "files",
    xpReward: 30,
    requiredLevel: 2,
    condition: { type: "delete_file_or_dir" },
    translations: {
      en: { title: "Clean Up", description: "Delete a file or directory using `rm`." },
      fi: { title: "Siivoa jälkesi", description: "Poista tiedosto tai kansio `rm`-komennolla." },
    },
  },
  {
    key: "first_mv",
    category: "files",
    xpReward: 30,
    requiredLevel: 2,
    condition: { type: "move_file_or_dir" },
    translations: {
      en: { title: "On the Move", description: "Move or rename a file using `mv`." },
      fi: {
        title: "Liikkeessä",
        description: "Siirrä tai nimeä tiedosto uudelleen `mv`-komennolla.",
      },
    },
  },
  {
    key: "create_and_read",
    category: "files",
    xpReward: 40,
    requiredLevel: 2,
    condition: { type: "run_command", command: "cat" },
    translations: {
      en: {
        title: "Make & Read",
        description: "Create a file with `touch`, then read it with `cat`.",
      },
      fi: {
        title: "Luo ja lue",
        description: "Luo tiedosto `touch`-komennolla ja lue se `cat`-komennolla.",
      },
    },
  },
  // -------------------------------------------------------------------------
  // Editor
  // -------------------------------------------------------------------------
  {
    key: "first_vim",
    category: "editor",
    xpReward: 50,
    requiredLevel: 3,
    condition: { type: "run_command", command: "vim" },
    translations: {
      en: { title: "Enter the Editor", description: "Open a file in vim." },
      fi: { title: "Avaa editori", description: "Avaa tiedosto vim-editorissa." },
    },
  },
  {
    key: "edit_and_save",
    category: "editor",
    xpReward: 75,
    requiredLevel: 3,
    condition: { type: "edit_and_save_file" },
    translations: {
      en: { title: "Write Something", description: "Edit a file in vim and save it." },
      fi: { title: "Kirjoita jotain", description: "Muokkaa tiedostoa vimissä ja tallenna se." },
    },
  },
  // -------------------------------------------------------------------------
  // Misc / exploration
  // -------------------------------------------------------------------------
  {
    key: "first_echo",
    category: "exploration",
    xpReward: 10,
    requiredLevel: 1,
    condition: { type: "run_command", command: "echo" },
    translations: {
      en: { title: "Hello, World!", description: "Use `echo` to print a message." },
      fi: { title: "Hei, maailma!", description: "Käytä `echo`-komentoa tulostamaan viesti." },
    },
  },
  {
    key: "check_date",
    category: "exploration",
    xpReward: 10,
    requiredLevel: 1,
    condition: { type: "run_command", command: "date" },
    translations: {
      en: {
        title: "What Time Is It?",
        description: "Run `date` to see the current date and time.",
      },
      fi: {
        title: "Mitä kello on?",
        description: "Suorita `date` nähdäksesi nykyisen päivämäärän ja ajan.",
      },
    },
  },
  {
    key: "use_help",
    category: "exploration",
    xpReward: 10,
    requiredLevel: 1,
    condition: { type: "run_command", command: "help" },
    translations: {
      en: { title: "Ask for Help", description: "Run `help` to see available commands." },
      fi: {
        title: "Pyydä apua",
        description: "Suorita `help` nähdäksesi käytettävissä olevat komennot.",
      },
    },
  },
] as const;

/**
 * Get tasks available at a specific level (required_level <= userLevel)
 */
export function getAvailableTasks(userLevel: number): Task[] {
  return TASKS.filter((task) => task.requiredLevel <= userLevel);
}
