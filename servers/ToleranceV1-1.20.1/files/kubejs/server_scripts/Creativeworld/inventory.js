// priority: 10

function invPath(player) {
  return `kubejs/data/player_inventories/${player.uuid}.json`;
}

global.saveInventory = (player) => {
  try {
	console.log("Starting save inventory for: " + player.username);
	let inventoryData = {};
	let savedItemCount = 0;
	
	// Save main inventory (slots 0-35: hotbar + main inventory)
	for (let i = 0; i < 36; i++) {
	  let stack = player.inventory.getItem(i);
	  if (!stack.isEmpty()) {
		savedItemCount++;
		inventoryData["slot_" + i] = {
		  id: stack.id,
		  count: stack.count,
		  nbtString: stack.nbt && !stack.nbt.isEmpty() ? stack.nbt.toString() : "null"
		};
		console.log("Saved item in slot " + i + ": " + stack.id + " x" + stack.count);
	  }
	}

	// Save armor slots using a safer method
	try {
	  let armorSlots = ["feet", "legs", "chest", "head"];
	  for (let i = 0; i < 4; i++) {
		// Use commands to get armor data since direct access is problematic
		let tempFile = `kubejs/data/temp_armor_${player.uuid}_${i}.json`;
		player.server.runCommandSilent(`data get entity ${player.username} Inventory[{Slot:${100 + i}b}] > ${tempFile}`);
		
		// For now, we'll try a different approach - save what we can detect
		if (player.inventory.armor && player.inventory.armor[i] && !player.inventory.armor[i].isEmpty()) {
		  inventoryData["armor_" + armorSlots[i]] = {
			id: player.inventory.armor[i].id,
			count: player.inventory.armor[i].count,
			nbtString: player.inventory.armor[i].nbt && !player.inventory.armor[i].nbt.isEmpty() ? 
					  player.inventory.armor[i].nbt.toString() : "null"
		  };
		}
	  }
	} catch (armorError) {
	  console.warn("Could not save armor data: " + armorError);
	}
	
	// Save offhand
	try {
	  if (player.inventory.offhand && player.inventory.offhand[0] && !player.inventory.offhand[0].isEmpty()) {
		inventoryData["offhand"] = {
		  id: player.inventory.offhand[0].id,
		  count: player.inventory.offhand[0].count,
		  nbtString: player.inventory.offhand[0].nbt && !player.inventory.offhand[0].nbt.isEmpty() ? 
					player.inventory.offhand[0].nbt.toString() : "null"
		};
	  }
	} catch (offhandError) {
	  console.warn("Could not save offhand data: " + offhandError);
	}
	
	let data = {
	  inventory: inventoryData,
	  location: {
		dimension: player.level.dimension.toString(),
		x: player.x,
		y: player.y,
		z: player.z,
		yaw: player.yaw,
		pitch: player.pitch
	  },
	  experience: {
		level: player.xp,
		points: player.totalExperience
	  },
	  health: player.health,
	  food: player.foodData.foodLevel,
	  saturation: player.foodData.saturation || player.foodData.saturationLevel || 0
	};

	JsonIO.write(invPath(player), data);
	console.log("Saved inventory for player: " + player.username + " - Total items: " + savedItemCount);
	console.log("Inventory data keys: " + Object.keys(inventoryData).join(", "));
	
  } catch (error) {
	console.error("Error saving inventory for " + player.username + ": " + error);
  }
};

global.loadInventory = (player) => {
  try {
	let data = JsonIO.read(invPath(player));
	if (!data) {
	  console.log("No saved inventory found for player: " + player.username);
	  return;
	}

	player.inventory.clear();

	// Restore items using commands - this avoids the problematic array access
	if (data.inventory) {
	  // Restore main inventory slots (0-35)
	  for (let i = 0; i < 36; i++) {
		let slotKey = "slot_" + i;
		if (data.inventory[slotKey]) {
		  let itemData = data.inventory[slotKey];
		  let slotType = i < 9 ? "hotbar" : "inventory";
		  let slotIndex = i < 9 ? i : (i - 9);
		  
		  try {
			if (itemData.nbtString && itemData.nbtString !== "{}" && itemData.nbtString !== "null") {
			  let command = "item replace entity " + player.username + " " + slotType + "." + slotIndex + " with " + itemData.id + itemData.nbtString + " " + itemData.count;
			  player.server.runCommandSilent(command);
			} else {
			  let command = "item replace entity " + player.username + " " + slotType + "." + slotIndex + " with " + itemData.id + " " + itemData.count;
			  player.server.runCommandSilent(command);
			}
			console.log("Restored item to slot " + i + ": " + itemData.id);
		  } catch (cmdError) {
			console.warn("Command failed for slot " + i + ": " + cmdError);
			// Fallback: try give command
			try {
			  player.server.runCommandSilent("give " + player.username + " " + itemData.id + " " + itemData.count);
			} catch (giveError) {
			  console.error("Give command also failed: " + giveError);
			}
		  }
		}
	  }
	  
	  // Restore armor
	  let armorSlots = ["feet", "legs", "chest", "head"];
	  for (let i = 0; i < 4; i++) {
		let armorKey = "armor_" + armorSlots[i];
		if (data.inventory && data.inventory[armorKey]) {
		  let itemData = data.inventory[armorKey];
		  
		  // Add null checks for itemData properties
		  if (!itemData || !itemData.id) {
			console.warn("Invalid armor data for " + armorSlots[i]);
			continue;
		  }
		  
		  try {
			if (itemData.nbtString && itemData.nbtString !== "{}" && itemData.nbtString !== "null" && itemData.nbtString !== null) {
			  let command = "item replace entity " + player.username + " armor." + armorSlots[i] + " with " + itemData.id + itemData.nbtString + " " + (itemData.count || 1);
			  player.server.runCommandSilent(command);
			} else {
			  let command = "item replace entity " + player.username + " armor." + armorSlots[i] + " with " + itemData.id + " " + (itemData.count || 1);
			  player.server.runCommandSilent(command);
			}
			console.log("Restored armor " + armorSlots[i] + ": " + itemData.id);
		  } catch (cmdError) {
			console.warn("Command failed for armor " + armorSlots[i] + ": " + cmdError);
		  }
		}
	  }
	  
	  // Restore offhand
	  if (data.inventory && data.inventory["offhand"]) {
		let itemData = data.inventory["offhand"];
		
		// Add null checks for itemData properties
		if (itemData && itemData.id) {
		  try {
			if (itemData.nbtString && itemData.nbtString !== "{}" && itemData.nbtString !== "null" && itemData.nbtString !== null) {
			  let command = "item replace entity " + player.username + " weapon.offhand with " + itemData.id + itemData.nbtString + " " + (itemData.count || 1);
			  player.server.runCommandSilent(command);
			} else {
			  let command = "item replace entity " + player.username + " weapon.offhand with " + itemData.id + " " + (itemData.count || 1);
			  player.server.runCommandSilent(command);
			}
			console.log("Restored offhand: " + itemData.id);
		  } catch (cmdError) {
			console.warn("Command failed for offhand: " + cmdError);
		  }
		} else {
		  console.warn("Invalid offhand data");
		}
	  }
	}
	
	// Restore experience
	if (data.experience) {
	  player.xp = data.experience.level || 0;
	  player.totalExperience = data.experience.points || 0;
	}
	
	// Restore location - teleport back to saved position
	if (data.location) {
	  player.server.scheduleInTicks(1, () => {
		try {
		  player.teleportTo(
			data.location.dimension,
			data.location.x,
			data.location.y,
			data.location.z,
			data.location.yaw || 0.0,
			data.location.pitch || 0.0
		  );
		} catch (tpError) {
		  console.error("Failed to teleport player back: " + tpError);
		}
	  });
	}
	
	// Restore health and food (with delay to ensure proper loading)
	player.server.scheduleInTicks(2, () => {
	  try {
		if (data.health) player.health = data.health;
		if (data.food !== undefined) player.foodData.foodLevel = data.food;
		if (data.saturation !== undefined) {
		  // Try different property names for saturation in KubeJS 1.20.1
		  try {
			player.foodData.saturation = data.saturation;
		  } catch (satError) {
			try {
			  player.foodData.saturationLevel = data.saturation;
			} catch (satError2) {
			  console.warn("Could not restore saturation: " + satError2);
			}
		  }
		}
	  } catch (statError) {
		console.warn("Failed to restore health/food: " + statError);
	  }
	});

	// Delete the save file after successful restore - skip deletion for now to avoid errors
	// We'll leave the file for manual cleanup or implement this later
	console.log("Restored inventory for player: " + player.username);
	
  } catch (error) {
	console.error("Error loading inventory for " + player.username + ": " + error);
  }
};