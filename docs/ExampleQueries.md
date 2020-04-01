# Example Queries

Here is a list of example queries you can execute on playground to test this boilerplate.

## Query

```graphql
# List all Todos tagged: "test"
query Todos {
  todos(tags:["test"]) {
    id
    name
    tags {
      slug
    }
  }
}

# List all Tags
query Tags {
  tags {
    id
    slug
  }
}
```

## Mutation

```graphql
# Create a todo
query CreateTodo {
  createTodo(
    name: "My to-do"
    tags: ["test", "anothertag"]
  ) {
    id
    name
    tags {
      id
      slug
    }
  }
}
```
