WHITE = (255, 255, 255)
GREY = (180, 180, 180)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)

BLUE_SHAPE = (68, 81, 130)
RED_SHAPE = (140, 10, 12)


def hex_to_rgb_color(hex_string):
    hex_color = hex_string.lstrip("#")
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex_color(rgb_tuple):
    return '#%02x%02x%02x' % rgb_tuple


def convert_json_coords_to_json_rects(grid_size, object_dict):
    walls = object_dict["walls"]

    rect_walls = []
    for wall in walls:
        x_0, y_0, x_1, y_1, color = wall
        rect_walls.append([x_0 * grid_size, y_0 * grid_size, x_1 * grid_size + grid_size, y_1 * grid_size + grid_size,
                           color])

    return rect_walls


if __name__ == "__main__":
    print(hex_to_rgb_color("#FF00FF"))
    print(rgb_to_hex_color((255, 0, 255)))
