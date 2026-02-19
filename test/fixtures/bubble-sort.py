def bubble_sort(arr):
    """Sort array using bubble sort - intentionally inefficient O(n^2)."""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - 1):
            if arr[j] > arr[j + 1]:
                temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
    return arr


if __name__ == "__main__":
    import random
    data = [random.randint(1, 1000) for _ in range(100)]
    sorted_data = bubble_sort(data)
    print(f"Sorted {len(sorted_data)} elements")
    assert sorted_data == sorted(data), "Sort failed!"
    print("OK")
