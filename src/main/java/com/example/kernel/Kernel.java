package com.example.kernel;

import org.bukkit.plugin.java.JavaPlugin;
import com.example.kernel.commands.BroadcastCommand;
import com.example.kernel.commands.ChatControlCommands;
import com.example.kernel.commands.PlaytimeCommand;
import com.example.kernel.commands.DayNightCommand;
import com.example.kernel.commands.GodCommand;
import com.example.kernel.commands.ScaleCommand;
import com.example.kernel.commands.VanishCommand;
import com.example.kernel.listeners.ChatListener;

public class Kernel extends JavaPlugin {

    @Override
    public void onEnable() {
        // Register commands
        this.getCommand("broadcast").setExecutor(new BroadcastCommand());
        this.getCommand("broadcast").setTabCompleter(new BroadcastCommand());

        this.getCommand("playtime").setExecutor(new PlaytimeCommand());
        this.getCommand("playtime").setTabCompleter(new PlaytimeCommand());

        this.getCommand("vanish").setExecutor(new VanishCommand());
        this.getCommand("vanish").setTabCompleter(new VanishCommand());

        this.getCommand("god").setExecutor(new GodCommand());
        this.getCommand("god").setTabCompleter(new GodCommand());

        this.getCommand("scale").setExecutor(new ScaleCommand());
        this.getCommand("scale").setTabCompleter(new ScaleCommand());

        this.getCommand("day").setExecutor(new DayNightCommand());
        this.getCommand("night").setExecutor(new DayNightCommand());

        ChatControlCommands chatControl = new ChatControlCommands();
        this.getCommand("chat").setExecutor(chatControl);
        this.getCommand("chat").setTabCompleter(chatControl);
        
        // Register chat listener
        getServer().getPluginManager().registerEvents(new ChatListener(chatControl), this);
    }

    @Override
    public void onDisable() {
        getLogger().info("Kernel disabled!");
    }
}