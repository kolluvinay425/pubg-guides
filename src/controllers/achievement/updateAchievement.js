const updateAchievement = async (req, res) => {
  const achievementsData = JSON.parse(jsonAchievements);
  console.log("length", achievementsData.length);
  try {
    // Start a transaction to ensure atomicity
    await sequelize.transaction(async (t) => {
      for (let achievementData of achievementsData) {
        await createAchievement(achievementData, { transaction: t });
      }
    });
    res.status(200).send("Achievements created successfully!");
  } catch (error) {
    console.error("Error during transaction:", error); // Log error for debugging
    res.status(500).send("Error creating achievements");
  }
};

export { updateAchievement };
