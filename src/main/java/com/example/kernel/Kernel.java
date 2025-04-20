package com.example.kernel;

import org.bukkit.plugin.java.JavaPlugin;
import net.luckperms.api.LuckPerms;

import org.bukkit.Bukkit;
import org.bukkit.plugin.RegisteredServiceProvider;

import com.example.kernel.commands.*;

import com.example.kernel.listeners.ChatListener;
import com.example.kernel.listeners.PlayerJoinLeave;
import com.example.kernel.managers.TabManager;

public class Kernel extends JavaPlugin {
    private LuckPerms luckPerms;
    private TabManager tabManager;

    @Override
    public void onEnable() {

        // Setup LuckPerms integration
        RegisteredServiceProvider<LuckPerms> provider = getServer().getServicesManager()
                .getRegistration(LuckPerms.class);
        if (provider != null) {
            luckPerms = provider.getProvider();

            // Initialize TabManager with server's scoreboard
            tabManager = new TabManager(luckPerms, Bukkit.getScoreboardManager().getMainScoreboard());
            getServer().getPluginManager().registerEvents(tabManager, this);
            
            // Update tab list for online players (in case of reload)
            Bukkit.getOnlinePlayers().forEach(player -> tabManager.updatePlayerTab(player));
        }

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
        getServer().getPluginManager().registerEvents(new ChatListener(chatControl, luckPerms), this);
        getServer().getPluginManager().registerEvents(new PlayerJoinLeave(), this);
    }

    @Override
    public void onDisable() {

        if (tabManager != null) {
            // Clean up teams on disable
            Bukkit.getOnlinePlayers().forEach(player -> tabManager.removePlayer(player));
        }

        getLogger().info("Kernel disabled!");
    }
}