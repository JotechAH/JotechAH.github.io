// priority: 20
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event;

  // Configuration
  const TELEPORT_DELAY_SECONDS = 5; // Adjust this value as needed
  const pendingTeleports = new Map(); // Track pending teleportations

  function hasCuriosEquipped(player) {
    let found = false;

    player.curiosInventory.getCurios().forEach((identifier, slotInventory) => {
      const stacks = slotInventory.getStacks();
      for (let slot = 0; slot < stacks.slots; slot++) {
        const item = stacks.getStackInSlot(slot);
        if (!item.isEmpty()) {
          found = true;
          return; // exit the for-loop early for this slotInventory
        }
      }
    });

    return found;
  }

  function clearCurios(player) {
    player.curiosInventory.getCurios().forEach((identifier, slotInventory) => {
      const stacks = slotInventory.getStacks();
      for (let slot = 0; slot < stacks.slots; slot++) {
        const item = stacks.getStackInSlot(slot);
        if (!item.isEmpty()) {
          stacks.setStackInSlot(slot, Item.empty); // clear this slot
        }
      }
    });
  }

  function getPlayerPosition(player) {
    return {
      x: Math.floor(player.x * 100) / 100, // Round to 2 decimal places
      y: Math.floor(player.y * 100) / 100,
      z: Math.floor(player.z * 100) / 100
    };
  }

  function hasPlayerMoved(player, originalPos) {
    const currentPos = getPlayerPosition(player);
    return (
      Math.abs(currentPos.x - originalPos.x) > 0.1 ||
      Math.abs(currentPos.y - originalPos.y) > 0.1 ||
      Math.abs(currentPos.z - originalPos.z) > 0.1
    );
  }

  function cancelTeleport(playerId, reason) {
    if (pendingTeleports.has(playerId)) {
      const teleportData = pendingTeleports.get(playerId);
      pendingTeleports.delete(playerId);
      
      const player = teleportData.player;
      if (player && player.isPlayer()) {
        player.tell(`§cTeleportation cancelled: ${reason}`);
      }
      return true;
    }
    return false;
  }

  function startTeleportCountdown(player, teleportType) {
    const playerId = player.uuid.toString();
    
    // Cancel any existing teleport for this player
    if (pendingTeleports.has(playerId)) {
      cancelTeleport(playerId, "New teleport request");
    }

    const originalPos = getPlayerPosition(player);
    let countdown = TELEPORT_DELAY_SECONDS;

    // Store teleport data
    pendingTeleports.set(playerId, {
      player: player,
      originalPos: originalPos,
      teleportType: teleportType,
      countdown: countdown
    });

    player.tell(`§eTeleporting in ${countdown} seconds... Don't move!`);

    // Start countdown
    const countdownInterval = player.server.scheduleInTicks(0, () => {
      const teleportData = pendingTeleports.get(playerId);
      
      if (!teleportData) {
        return; // Teleport was cancelled
      }

      // Check if player still exists and is online
      if (!teleportData.player || !teleportData.player.isPlayer()) {
        pendingTeleports.delete(playerId);
        return;
      }

      // Check if player moved
      if (hasPlayerMoved(teleportData.player, teleportData.originalPos)) {
        cancelTeleport(playerId, "You moved!");
        return;
      }

      teleportData.countdown--;

      if (teleportData.countdown > 0) {
        if (teleportData.countdown <= 3) {
          teleportData.player.tell(`§c${teleportData.countdown}...`);
        } else if (teleportData.countdown % 2 === 0) {
          teleportData.player.tell(`§e${teleportData.countdown} seconds remaining...`);
        }

        // Schedule next countdown tick
        teleportData.player.server.scheduleInTicks(20, countdownInterval);
      } else {
        // Execute teleport
        executeTeleport(teleportData);
        pendingTeleports.delete(playerId);
      }
    });
  }

  function executeTeleport(teleportData) {
    const player = teleportData.player;
    const teleportType = teleportData.teleportType;

    try {
      if (teleportType === "enter") {
        // Check curios again before teleporting
        if (hasCuriosEquipped(player)) {
          player.tell("§cPlease remove all your curios items before going into Creative World!");
          return;
        }

        global.saveInventory(player);
        player.inventory.clear();

        // Use the KubeJS specific teleportTo method with ResourceLocation
        player.teleportTo("tolerance:creatif", 0.0, 71.0, 0.0, 0.0, 0.0);
        
        player.tell("§aYou entered the Creative World! Inventory saved.");

        // Add small delay before changing gamemode and rank
        player.server.scheduleInTicks(5, () => {
          player.setGameMode("creative");
          player.runCommandSilent("ftbranks add " + player.username + " creative_builder");
        });
        
      } else if (teleportType === "exit") {
        // Clear inventories before restoring
        player.inventory.clear();
        clearCurios(player); // <- auto-clear curios here
        
        // Add delay before restoring inventory, location, and changing gamemode
        player.server.scheduleInTicks(10, () => {
          global.loadInventory(player); // This will now handle teleporting back to saved location
          player.setGameMode("survival");
          player.runCommandSilent("ftbranks remove " + player.username + " creative_builder");
          player.tell("§aYou returned to Survival World! Inventory and location restored.");
        });
      }
    } catch (error) {
      console.error(`Error during ${teleportType} teleport: ` + error);
      player.tell(`§cError during teleportation. Please try again.`);
    }
  }

  event.register(
    Commands.literal("creativeworld")
      .requires(s => s.hasPermission(2)) // adjust with ftbranks later
      .then(
        Commands.literal("enter").executes(ctx => {
          let player = ctx.source.player;
          if (!player) return 0;

          // Check if player is already in creative world
          if (player.level.dimension.toString() === "tolerance:creatif") {
            player.tell("§cYou are already in the Creative World!");
            return 0;
          }

          // Check curios first
          if (hasCuriosEquipped(player)) {
            player.tell("§cPlease remove all your curios items before going into Creative World!");
            return 0;
          }

          // Start teleport countdown
          startTeleportCountdown(player, "enter");
          return 1;
        })
      )
      .then(
        Commands.literal("exit").executes(ctx => {
          let player = ctx.source.player;
          if (!player) return 0;

          // Check if player is in creative world
          if (player.level.dimension.toString() !== "tolerance:creatif") {
            player.tell("§cYou are not in the Creative World!");
            return 0;
          }

          // Start teleport countdown
          startTeleportCountdown(player, "exit");
          return 1;
        })
      )
      .then(
        Commands.literal("cancel").executes(ctx => {
          let player = ctx.source.player;
          if (!player) return 0;

          const playerId = player.uuid.toString();
          if (cancelTeleport(playerId, "Cancelled by player")) {
            return 1;
          } else {
            player.tell("§cYou don't have any pending teleportation.");
            return 0;
          }
        })
      )
  );

  // Clean up disconnected players from pending teleports
  PlayerEvents.loggedOut(event => {
    const playerId = event.player.uuid.toString();
    if (pendingTeleports.has(playerId)) {
      pendingTeleports.delete(playerId);
    }
  });
});