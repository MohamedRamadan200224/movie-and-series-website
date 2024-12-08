const { buildSchema } = require("graphql");

// Define the GraphQL schema
const schema = buildSchema(`
  type Content {
    _id: ID!
    category: String!
    title: String!
    imageCover: String!
    duration: Int!
    parentalGuide: String!
    genre: [String!]!
    production: String!
    rating: Float!
    productionImgs: String!
    quality: String!
    cast: [Cast!]!
    seasons: [Season]
    description: String!
    uploadDate: String!
  }

  input UserInput {
    _id: ID!
    userName: String!
    role: String!
    imageUrl: String!
    email: String!
    gender: String!
    age: Int!
    password: String!
    favorites: [Content]
    membership: String!
  }

  type Cast {
    castId: ID!
  }

  type Season {
    episodes: [String]
  }

  type Query {
    getContent(id: ID!): Content
    getAllContent: [Content!]!
    getTypes: [String!]!
    getGenres: [String!]!
    getProductions: [String!]!
    getParentalGuides: [String!]!
    getuser(user : UserInput)
  }

  input ContentInput {
    category: String!
    title: String!
    imageCover: String!
    duration: Int!
    parentalGuide: String!
    genre: [String!]!
    production: String!
    rating: Float!
    productionImgs: String!
    quality: String!
    cast: [CastInput!]!
    seasons: [SeasonInput]
    description: String!
  }

  input CastInput {
    castId: ID!
  }

  input SeasonInput {
    episodes: [String]
  }

  type Auth {
    token: String!
    user : UserInput!
  }

  type Mutation {
    addContent(content: ContentInput!): Content
    removeContent(id: ID!): Content
    updateContent(id: ID!, content: ContentInput!): Content
    login(user: UserInput!): Auth
    signup(user: UserInput!): Auth
    protect(user: UserInput!): Content
    restrictTo(roles: [String!]): Boolean
  }
`);

module.exports = schema;

// const {
//   GraphQLObjectType,
//   GraphQLString,
//   GraphQLInt,
//   GraphQLList,
//   GraphQLSchema,
//   GraphQLNonNull,
//   GraphQLID,
// } = require("graphql");

// const EpisodeType = new GraphQLObjectType({
//   name: "Episode",
//   fields: () => ({
//     id: { type: GraphQLID },
//     title: { type: GraphQLString },
//     duration: { type: GraphQLInt },
//   }),
// });

// // Define the SeasonType
// const SeasonType = new GraphQLObjectType({
//   name: "Season",
//   fields: () => ({
//     id: { type: GraphQLID },
//     seasonNumber: { type: GraphQLInt },
//     episodes: { type: new GraphQLList(EpisodeType) },
//   }),
// });

// const ContentType = new GraphQLObjectType({
//   name: "Content",
//   fields: () => ({
//     id: { type: GraphQLID },
//     category: { type: GraphQLString },
//     title: { type: GraphQLString },
//     imageCover: { type: GraphQLString },
//     duration: { type: GraphQLInt },
//     parentalGuide: { type: GraphQLString },
//     genre: { type: new GraphQLList(GraphQLString) },
//     production: { type: GraphQLString },
//     rating: { type: GraphQLInt },
//     productionImgs: { type: GraphQLString },
//     quality: { type: GraphQLString },
//     cast: { type: GraphQLString },
//     seasons: { type: new GraphQLList(SeasonType) },
//     description: { type: GraphQLString },
//     uploadDate: { type: GraphQLString },
//   }),
// });

// const RootQuery = new GraphQLObjectType({
//   name: "RootQueryType",
//   fields: {
//     content: {
//       type: ContentType,
//       args: { id: { type: GraphQLID } },
//     },
//     contents: {
//       type: new GraphQLList(ContentType),
//     },
//   },
// });

// const Mutation = new GraphQLObjectType({
//   name: "Mutation",
//   fields: {
//     addContent: {
//       type: ContentType,
//       args: {
//         category: { type: new GraphQLNonNull(GraphQLString) },
//         title: { type: new GraphQLNonNull(GraphQLString) },
//         imageCover: { type: new GraphQLNonNull(GraphQLString) },
//         duration: { type: new GraphQLNonNull(GraphQLInt) },
//         parentalGuide: { type: new GraphQLNonNull(GraphQLString) },
//         genre: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
//         production: { type: new GraphQLNonNull(GraphQLString) },
//         rating: { type: new GraphQLNonNull(GraphQLInt) },
//         productionImgs: { type: GraphQLString },
//         quality: { type: new GraphQLNonNull(GraphQLString) },
//         cast: { type: GraphQLString },
//         seasons: { type: new GraphQLList(GraphQLString) },
//         description: { type: new GraphQLNonNull(GraphQLString) },
//         uploadDate: { type: GraphQLString },
//       },
//     },
//     updateContent: {
//       type: ContentType,
//       args: {
//         category: { type: new GraphQLNonNull(GraphQLString) },
//         title: { type: new GraphQLNonNull(GraphQLString) },
//         imageCover: { type: new GraphQLNonNull(GraphQLString) },
//         duration: { type: new GraphQLNonNull(GraphQLInt) },
//         parentalGuide: { type: new GraphQLNonNull(GraphQLString) },
//         genre: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
//         production: { type: new GraphQLNonNull(GraphQLString) },
//         rating: { type: new GraphQLNonNull(GraphQLInt) },
//         productionImgs: { type: GraphQLString },
//         quality: { type: new GraphQLNonNull(GraphQLString) },
//         cast: { type: GraphQLString },
//         seasons: { type: new GraphQLList(GraphQLString) },
//         description: { type: new GraphQLNonNull(GraphQLString) },
//         uploadDate: { type: GraphQLString },
//       },
//     },
//     deleteContent: {
//       type: ContentType,
//       args: {
//         _id: { type: GraphQLID },
//       },
//     },
//   },
// });

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
