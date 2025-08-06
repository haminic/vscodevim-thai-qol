# Vim Thai QoL

## ▸ About 📖

This is a fork of the [Vim extension](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) for Visual Studio Code, with some quality-of-life improvements, specifically for writing Thai. It's mainly for personal use, and I'm sure it contradicts with many others' workflows.

Below are the changes I made, along with some rambling.

## ▸ Changes ➕

### Added command for typing in Vim modes: `vim.type`

The Vim extension overrides the `type` command to do their Vim emulation magic. The way they do this is they get the actual keyboard output to determine what to do depending on the bindings set. This causes the bindings to be language-dependent, meaning you're going to have to switch languages just to use them properly.

Vim (and the Vim extension) offer two solutions: 1) `langmap` configuration, and 2) `autoSwitchInputMethod`. Here's why they don't work for me:

- `langmap`: Some character positions get switched around in the Thai keyboard layout, making it impossible to fully map the Thai keyboard to their English counterparts without ruining the English bindings.

- `autoSwitchInputMethod`: This actually seemed fine at first. However, I think it just feels wrong for something to "randomly" switch your keyboard layout. (Also, semi-related: GNOME no longer provides a non-hacky way to switch keyboard layout via command line.)

My solution was to expose a new command, `vim.type`, that can be bound to their actual keys in VS Code's keyboard shortcuts (see [example-keybindings](example-keybindings.json)). Why does this solve the issue? Because VS Code provides a way to make the keyboard shortcuts positional (therefore, language-agnostic), which sidesteps the whole problem.

But no, wait, there's something else:

### Made Vim's `h` and `l` motions move through Thai grapheme clusters, not code points

When moving left or right, personally, I think the cursor should move by a whole grapheme "block" for Thai. Currently, the Vim extension moves by code points, which means if you `l` your way out of "ที่", it stops multiple times inside what looks like a single "column". This fork fixes that. (I also changed how the `a` action is handled to be more consistent with this new `h` and `l` system.)

(Please forgive any misuse of terminology. I really don't know much about this stuff.)
