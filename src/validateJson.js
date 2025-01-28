const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      name: { type: "string" },
      image: { type: "string" },
      description: { type: "string" },
      points: { type: "integer" },
      category: { type: "string" },
      hardness: { type: "string" },
      rewards: {
        type: "object",
        properties: {
          title: { type: "string" },
          titleImage: { type: "string" },
          extra: { type: "string" },
        },
        required: ["title", "titleImage", "extra"],
      },
      tipsTricks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            heading: { type: "string" },
            image: { type: "string" },
            description: { type: "string" },
          },
          required: ["heading", "image", "description"],
        },
      },
      requirements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            heading: { type: "string" },
            image: { type: "string" },
            icon_image: { type: "string" },
            description: { type: "string" },
          },
          required: ["heading", "image", "icon_image", "description"],
        },
      },
    },
    required: [
      "name",
      "image",
      "description",
      "points",
      "category",
      "hardness",
      "rewards",
      "tipsTricks",
      "requirements",
    ],
  },
};

export default schema;
