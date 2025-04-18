package com.example.kernel;

import org.bukkit.plugin.java.JavaPlugin;
import com.example.kernel.commands.BroadcastCommand;
import com.example.kernel.commands.PlaytimeCommand;
import com.example.kernel.commands.DayNightCommand;
import com.example.kernel.commands.VanishCommand;
import com.example.kernel.listeners.ChatListener;

public class Kernel extends JavaPlugin {

    @Override
    public void onEnable() {
        // Register broadcast command
        this.getCommand("broadcast").setExecutor(new BroadcastCommand());
        this.getCommand("broadcast").setTabCompleter(new BroadcastCommand());

        // Register playtime command
        this.getCommand("playtime").setExecutor(new PlaytimeCommand());
        this.getCommand("playtime").setTabCompleter(new PlaytimeCommand());

        // Register vanish command
        this.getCommand("vanish").setExecutor(new VanishCommand());
        this.getCommand("vanish").setTabCompleter(new VanishCommand());

        // Register time commands
        this.getCommand("day").setExecutor(new DayNightCommand());
        this.getCommand("night").setExecutor(new DayNightCommand());
        
        // Register chat listener
        getServer().getPluginManager().registerEvents(new ChatListener(), this);
    }

    @Override
    public void onDisable() {
        getLogger().info("Kernel disabled!");
    }
}