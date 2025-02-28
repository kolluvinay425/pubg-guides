"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add a temporary column to store the array data
    await queryInterface.addColumn("Requirements", "image_temp", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    // Migrate existing data into the new column as an array
    await queryInterface.sequelize.query(`
      UPDATE "Requirements"
      SET "image_temp" = ARRAY["image"]
      WHERE "image" IS NOT NULL;
    `);

    // Drop the old image column
    await queryInterface.removeColumn("Requirements", "image");

    // Rename the temporary column to image
    await queryInterface.renameColumn("Requirements", "image_temp", "image");
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes made in the "up" method
    await queryInterface.addColumn("Requirements", "image_temp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Migrate the array data back to a single string
    await queryInterface.sequelize.query(`
      UPDATE "Requirements"
      SET "image_temp" = "image"::text
    `);

    // Drop the new image column and rename back to the old column
    await queryInterface.removeColumn("Requirements", "image");
    await queryInterface.renameColumn("Requirements", "image_temp", "image");
  },
};
