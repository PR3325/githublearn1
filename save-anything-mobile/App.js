import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "savestack-items";

const categories = ["Studies", "Gym", "Politics", "Career", "Business", "Entertainment"];
const platforms = ["YouTube", "Instagram", "Facebook", "Website", "LinkedIn", "Other"];

const starterItems = [
  {
    id: "seed-1",
    url: "https://www.youtube.com/",
    title: "React Native basics playlist",
    category: "Studies",
    platform: "YouTube",
    note: "Good resource for building the real mobile app version.",
    favorite: true,
    createdAt: "2026-05-09T08:30:00.000Z",
  },
  {
    id: "seed-2",
    url: "https://www.instagram.com/",
    title: "Beginner gym routine reel",
    category: "Gym",
    platform: "Instagram",
    note: "Save for weekly workout plan.",
    favorite: false,
    createdAt: "2026-05-09T08:40:00.000Z",
  },
  {
    id: "seed-3",
    url: "https://www.linkedin.com/",
    title: "Internship preparation post",
    category: "Career",
    platform: "LinkedIn",
    note: "Useful checklist for resume and interview practice.",
    favorite: true,
    createdAt: "2026-05-09T08:50:00.000Z",
  },
];

const emptyForm = {
  url: "",
  title: "",
  category: "Studies",
  platform: "YouTube",
  note: "",
};

export default function App() {
  const [items, setItems] = useState(starterItems);
  const [form, setForm] = useState(emptyForm);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const visibleCategories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );

  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const searchableText = `${item.title} ${item.category} ${item.platform} ${item.note}`.toLowerCase();
      return matchesCategory && (!cleanQuery || searchableText.includes(cleanQuery));
    });
  }, [activeCategory, items, query]);

  async function loadItems() {
    const savedItems = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }

  function updateForm(key, value) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function saveItem() {
    if (!form.url.trim() || !form.title.trim()) {
      Alert.alert("Missing details", "Add a link and title before saving.");
      return;
    }

    const existingItem = items.find((item) => item.id === editingId);
    const nextItem = {
      id: editingId || `${Date.now()}`,
      url: form.url.trim(),
      title: form.title.trim(),
      category: form.category,
      platform: form.platform,
      note: form.note.trim(),
      favorite: existingItem?.favorite || false,
      createdAt: existingItem?.createdAt || new Date().toISOString(),
    };

    setItems((currentItems) =>
      editingId
        ? currentItems.map((item) => (item.id === editingId ? nextItem : item))
        : [nextItem, ...currentItems]
    );

    setForm(emptyForm);
    setEditingId(null);
  }

  function editItem(item) {
    setEditingId(item.id);
    setForm({
      url: item.url,
      title: item.title,
      category: item.category,
      platform: item.platform,
      note: item.note,
    });
  }

  function deleteItem(id) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function toggleFavorite(id) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    );
  }

  function openLink(url) {
    Linking.openURL(url).catch(() => {
      Alert.alert("Could not open link", "Please check the URL and try again.");
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SaveStack</Text>
          <Text style={styles.title}>Save anything, find it fast.</Text>
        </View>

        <View style={styles.statsGrid}>
          <Stat value={items.length} label="Saved" />
          <Stat value={visibleCategories.length - 1} label="Categories" />
          <Stat value={items.filter((item) => item.favorite).length} label="Favorites" />
        </View>

        <View style={styles.panel}>
          <Field label="Link or URL" value={form.url} onChangeText={(value) => updateForm("url", value)} />
          <Field label="Title" value={form.title} onChangeText={(value) => updateForm("title", value)} />

          <Text style={styles.label}>Category</Text>
          <PillSelector
            options={categories}
            value={form.category}
            onChange={(value) => updateForm("category", value)}
          />

          <Text style={styles.label}>Platform</Text>
          <PillSelector
            options={platforms}
            value={form.platform}
            onChange={(value) => updateForm("platform", value)}
          />

          <Field
            label="Note"
            value={form.note}
            onChangeText={(value) => updateForm("note", value)}
            multiline
          />

          <Pressable style={styles.primaryButton} onPress={saveItem}>
            <Text style={styles.primaryButtonText}>{editingId ? "Update item" : "Save item"}</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search saved links"
          placeholderTextColor="#69746f"
        />

        <PillSelector options={visibleCategories} value={activeCategory} onChange={setActiveCategory} />

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionHeading}>Your library</Text>
          <Pressable
            onPress={() => {
              setActiveCategory("All");
              setQuery("");
            }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No saved items found</Text>
            <Text style={styles.emptyText}>
              Save a video, reel, article, or useful link and it will appear here by category.
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <SavedCard
              key={item.id}
              item={item}
              onOpen={() => openLink(item.url)}
              onFavorite={() => toggleFavorite(item.id)}
              onEdit={() => editItem(item)}
              onDelete={() => deleteItem(item.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Field({ label, multiline = false, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, multiline && styles.textarea]}
        placeholderTextColor="#69746f"
        multiline={multiline}
      />
    </View>
  );
}

function PillSelector({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
      {options.map((option) => (
        <Pressable
          key={option}
          style={[styles.selectorPill, value === option && styles.selectorPillActive]}
          onPress={() => onChange(option)}
        >
          <Text style={[styles.selectorText, value === option && styles.selectorTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function SavedCard({ item, onOpen, onFavorite, onEdit, onDelete }) {
  return (
    <View style={styles.savedCard}>
      <View style={styles.platformMark}>
        <Text style={styles.platformMarkText}>{item.platform.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.savedBody}>
        <Text style={styles.savedTitle}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaPill}>{item.category}</Text>
          <Text style={styles.metaPill}>{item.platform}</Text>
          {item.favorite ? <Text style={styles.metaPill}>Favorite</Text> : null}
        </View>
        <Text style={styles.note}>{item.note || "No note added yet."}</Text>
        <View style={styles.actionRow}>
          <SmallButton label="Open" onPress={onOpen} />
          <SmallButton label={item.favorite ? "Unsave" : "Favorite"} onPress={onFavorite} />
          <SmallButton label="Edit" onPress={onEdit} />
          <SmallButton label="Delete" onPress={onDelete} />
        </View>
      </View>
    </View>
  );
}

function SmallButton({ label, onPress }) {
  return (
    <Pressable style={styles.smallButton} onPress={onPress}>
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#edf2ef",
  },
  content: {
    padding: 18,
    paddingBottom: 34,
  },
  header: {
    marginTop: 10,
    marginBottom: 18,
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#16201c",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 37,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  statValue: {
    color: "#0b4f4a",
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: "#69746f",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#69746f",
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    minHeight: 44,
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    color: "#16201c",
    paddingHorizontal: 12,
  },
  textarea: {
    minHeight: 74,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0b4f4a",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    color: "#16201c",
    marginTop: 16,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  pillRow: {
    gap: 8,
    paddingVertical: 10,
  },
  selectorPill: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  selectorPillActive: {
    backgroundColor: "#0b4f4a",
    borderColor: "#0b4f4a",
  },
  selectorText: {
    color: "#69746f",
    fontSize: 13,
    fontWeight: "800",
  },
  selectorTextActive: {
    color: "#ffffff",
  },
  sectionTitle: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeading: {
    color: "#16201c",
    fontSize: 18,
    fontWeight: "900",
  },
  clearText: {
    color: "#0b4f4a",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 22,
  },
  emptyTitle: {
    color: "#16201c",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    color: "#69746f",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },
  savedCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  platformMark: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  platformMarkText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  savedBody: {
    flex: 1,
  },
  savedTitle: {
    color: "#16201c",
    fontSize: 16,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  metaPill: {
    backgroundColor: "#e7f1ee",
    borderRadius: 8,
    color: "#69746f",
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  note: {
    color: "#69746f",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  smallButton: {
    borderColor: "#d9e2dd",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallButtonText: {
    color: "#16201c",
    fontSize: 12,
    fontWeight: "900",
  },
});
