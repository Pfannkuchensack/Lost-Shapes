import pygame
import pygame.key
import json

import util


class App:

    SCALE = 2

    def __init__(self):
        self._running = True
        self._display_surf = None
        self.size = self.width, self.height = 640, 420
        self.grid_size = 10

        self.map = Map(self.width, self.height, self.grid_size)

        self.mouse_pressed = False # True while mouse pressed
        self.mouse_tile_status = False # if a wall is clicked remove walls, else make walls

        self.color = util.BLACK

    def on_init(self):
        pygame.init()
        self._display_surf = pygame.display.set_mode(tuple(self.SCALE * i for i in self.size), pygame.HWSURFACE |
                                                     pygame.DOUBLEBUF)
        self._running = True

    def on_event(self, event):
        if event.type == pygame.QUIT:
            self._running = False

        if event.type == pygame.MOUSEBUTTONDOWN:
            self.mouse_pressed = True
            pos = pygame.mouse.get_pos()
            x_coord, y_coord = self.get_tile_coord(pos[0], pos[1])
            if not self.map.tiles[y_coord][x_coord].tile_state:
                self.mouse_tile_status = True
            else:
                self.mouse_tile_status = False

        if event.type == pygame.MOUSEBUTTONUP:
            self.mouse_pressed = False

        if event.type == pygame.KEYDOWN:
            if event.key == ord('s'):
                self.map.save_to_json()
            if event.key == ord('l'):
                self.map.load_from_json()
            if event.key == ord('q'):
                self.color = util.BLUE
            if event.key == ord('w'):
                self.color = util.RED
            if event.key == ord('e'):
                self.color = util.BLACK

    def on_loop(self):
        if self.mouse_pressed:
            pos = pygame.mouse.get_pos()
            x_coord, y_coord = self.get_tile_coord(pos[0], pos[1])
            if self.mouse_tile_status:
                self.map.tiles[y_coord][x_coord].color = self.color
                self.map.tiles[y_coord][x_coord].tile_state = True
            else:
                self.map.tiles[y_coord][x_coord].color = util.WHITE
                self.map.tiles[y_coord][x_coord].tile_state = False


    def on_render(self):
        self._display_surf.fill(util.WHITE)

        for y_coord, row in enumerate(self.map.tiles):
            for x_coord, tile in enumerate(row):
                tile_shape = (x_coord * self.grid_size, y_coord * self.grid_size,
                              self.grid_size, self.grid_size)
                scaled_tile = tuple(self.SCALE * i for i in tile_shape)
                if tile.tile_state:
                    pygame.draw.rect(self._display_surf, tile.color,
                                     scaled_tile)
                else:
                    pygame.draw.rect(self._display_surf, util.GREY,
                                     scaled_tile, 1)

        pygame.display.update()

    def on_cleanup(self):
        pygame.quit()

    def on_execute(self):
        if self.on_init() == False:
            self._running = False

        while self._running:
            for event in pygame.event.get():
                self.on_event(event)
            self.on_loop()
            self.on_render()
        self.on_cleanup()

    def get_tile_coord(self, canvas_x, canvas_y):
        unscaled_x = canvas_x // self.SCALE
        unscaled_y = canvas_y // self.SCALE

        return unscaled_x // self.grid_size, unscaled_y // self.grid_size


class Map:

    def __init__(self, width, height, grid_size):

        x_tiles = width // grid_size
        y_tiles = height // grid_size
        self.grid_size = grid_size

        # tiles[y_coord][x_coord]
        self.tiles = [[Tile(False, util.WHITE) for x in range(x_tiles)] for y in range(y_tiles)]

    def get_color_wall_map(self, color):
        colored_map = []
        for row in self.tiles:
            temp_row = []
            for tile in row:
                if tile.color == color:
                    temp_row.append(True)
                else:
                    temp_row.append(False)
            colored_map.append(temp_row)
        return colored_map

    def save_to_json(self):

        colors = [util.BLACK, util.BLUE, util.RED]
        walls = []
        for color in colors:
            colored_map = self.get_color_wall_map(color)

            # find x walls - key: y_coord, value [(x_start, x_end), (x_start, x_end)...]
            x_walls = {}
            for y, row in enumerate(colored_map):
                prev_tile_state = False
                wall_start = -1
                for x, tile_state in enumerate(row):
                    if prev_tile_state is False and tile_state:
                        wall_start = x
                        prev_tile_state = True
                    elif prev_tile_state and tile_state is False:
                        if x - 1 - wall_start > 1:
                            if y not in x_walls:
                                x_walls[y] = []
                            x_walls[y].append((wall_start, x - 1))
                        prev_tile_state = False
                        wall_start = -1
                if prev_tile_state:
                    if x - 1 - wall_start > 1:
                        if y not in x_walls:
                            x_walls[y] = []
                        x_walls[y].append((wall_start, x))



            # find y walls
            y_walls = {}
            transposed_color_map = list(map(list, zip(*colored_map)))
            for x, col in enumerate(transposed_color_map):
                prev_tile_state = False
                wall_start = -1
                for y, tile_state in enumerate(col):
                    if prev_tile_state is False and tile_state:
                        wall_start = y
                        prev_tile_state = True
                    elif prev_tile_state and tile_state is False:
                        if y - 1 - wall_start > 1:
                            if x not in y_walls:
                                y_walls[x] = []
                            y_walls[x].append((wall_start, y - 1))
                        prev_tile_state = False
                        wall_start = -1
                if prev_tile_state:
                    if y - 1 - wall_start > 1:
                        if x not in y_walls:
                            y_walls[x] = []
                        y_walls[x].append((wall_start, y))

            # find pixel walls
            pixel_walls = {}

            for key, wall_values in x_walls.items():
                for wall_value in wall_values:
                    # x_coord_0, y_coord_0, x_coord_1, y_coord_1, color
                    walls.append([wall_value[0], key, wall_value[1], key, util.rgb_to_hex_color(color)])
            for key, wall_values in y_walls.items():
                for wall_value in wall_values:
                    # x_coord_0, y_coord_0, x_coord_1, y_coord_1, color
                    walls.append([key, wall_value[0], key, wall_value[1], util.rgb_to_hex_color(color)])

        # save to json
        with open('map_files/map_coords_001.json', 'w') as outfile:
            json.dump({"walls": walls}, outfile, indent=4)

        with open('map_files/map_001.json', 'w') as outfile:
            json.dump({"buttons": [], "walls": util.convert_json_coords_to_json_rects(
                self.grid_size, {"walls": walls})}, outfile, indent=4)

    def load_from_json(self):
        # reset tiles
        for row in self.tiles:
            for tile in row:
                tile.tile_state = False
                tile.color = util.WHITE

        with open('map_files/map_coords_001.json', 'r') as jsonfile:
            json_data = json.load(jsonfile)
            walls = json_data["walls"]
            for wall in walls:
                x_0, y_0, x_1, y_1, color = wall
                if x_0 == x_1:
                    for y_coord in range(y_0, y_1 + 1):
                        self.tiles[y_coord][x_0].tile_state = True
                        self.tiles[y_coord][x_0].color = util.hex_to_rgb_color(color)
                else:
                    for x_coord in range(x_0, x_1 + 1):
                        self.tiles[y_0][x_coord].tile_state = True
                        self.tiles[y_0][x_coord].color = util.hex_to_rgb_color(color)



class Tile:

    def __init__(self, tile_state, color):
        """

        :param tile_state: True = wall, False = no wall
        :param color: RGB Color
        """
        self.tile_state = tile_state
        self.color = color


if __name__ == "__main__":
    theApp = App()
    theApp.on_execute()
