import React, { useState } from "react";
import {
  View, Text, TextInput, Button, FlatList,
  StyleSheet, Alert, ScrollView
} from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();
const API = "https://jsonplaceholder.typicode.com/posts";

function PostsApp() {
  const qc = useQueryClient();

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editId, setEditId] = useState("");
  const [patchTitle, setPatchTitle] = useState("");

  const fetchPosts = async () => {
    const url = userId ? `${API}?userId=${userId}` : API;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  };

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["posts", userId],
    queryFn: fetchPosts,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, userId: 1 }),
      });
      return res.json();
    },
    onSuccess: () => {
      Alert.alert("Success", "Post created");
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, title, body, userId: 1 }),
      });
      return res.json();
    },
    onSuccess: () => {
      Alert.alert("Success", "Post fully updated with PUT");
      setEditId("");
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const patchPost = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: patchTitle }),
      });
      return res.json();
    },
    onSuccess: () => {
      Alert.alert("Success", "Title patched only");
      setPatchTitle("");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: () => {
      Alert.alert("Deleted", "Post deleted");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (isLoading) return <Text style={styles.center}>Loading posts...</Text>;
  if (error) return <Text style={styles.center}>Error loading posts.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>CRUD Posts App</Text>

      <Text style={styles.label}>Filter by User ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: 1"
        keyboardType="numeric"
        value={userId}
        onChangeText={setUserId}
      />

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter post title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Body</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter post body"
        value={body}
        onChangeText={setBody}
        multiline
      />

      <Button
        title="Create Post - POST"
        onPress={() => createPost.mutate()}
        disabled={!title || !body}
      />

      <View style={styles.space} />

      <Text style={styles.label}>Post ID to fully update</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: 1"
        keyboardType="numeric"
        value={editId}
        onChangeText={setEditId}
      />

      <Button
        title="Update Post - PUT"
        onPress={() => updatePost.mutate()}
        disabled={!editId || !title || !body}
      />

      <Text style={styles.label}>Patch Title Only</Text>
      <TextInput
        style={styles.input}
        placeholder="New title only"
        value={patchTitle}
        onChangeText={setPatchTitle}
      />

      <FlatList
        data={data.slice(0, 20)}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.postTitle}>#{item.id} {item.title}</Text>
            <Text>{item.body}</Text>

            <View style={styles.buttonRow}>
              <Button
                title="Patch"
                onPress={() => patchPost.mutate(item.id)}
                disabled={!patchTitle}
              />
              <Button
                title="Delete"
                color="red"
                onPress={() => deletePost.mutate(item.id)}
              />
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostsApp />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    backgroundColor: "#f5f5f5",
  },
  center: {
    marginTop: 80,
    textAlign: "center",
    fontSize: 18,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 90,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  space: {
    height: 10,
  },
});
