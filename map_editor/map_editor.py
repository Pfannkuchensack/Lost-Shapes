import pygame
from pygame.locals import *
import pygame.key
import json


class App:
    WHITE = (255, 255, 255)
    BLACK = (0, 0, 0)
    GREY = (180, 180, 180)
    RED = (255, 0, 0)
    BLUE = (0, 0, 255)

    SCALE = 2

    def __init__(self):
        self._running = True
        self._display_surf = None
        self.size = self.width, self.height = self.SCALE * 640, self.SCALE * 420

        self.map = Map(self.width, self.height, 10, self.SCALE)
        self.mouse_pressed = False
        self.square_state = False

        self.scale = 2

        self.color = self.BLACK

    def on_init(self):
        pygame.init()
        self._display_surf = pygame.display.set_mode(self.size, pygame.HWSURFACE | pygame.DOUBLEBUF)
        self._running = True

    def on_event(self, event):
        if event.type == pygame.QUIT:
            self._running = False

        if event.type == pygame.MOUSEBUTTONDOWN:
            self.mouse_pressed = True
            pos = pygame.mouse.get_pos()
            x_coord = pos[0] // self.map.division_size
            y_coord = pos[1] // self.map.division_size
            if self.map.squares[y_coord][x_coord]:
                self.square_state = False
            else:
                self.square_state = True

        if event.type == pygame.MOUSEBUTTONUP:
            self.mouse_pressed = False

        if event.type == pygame.KEYDOWN:
            if event.key == ord('s'):
                self.map.save_map()
            if event.key == ord('l'):
                self.map.load_map()
            if event.key == ord('q'):
                self.color = self.BLUE
            if event.key == ord('w'):
                self.color = self.RED
            if event.key == ord('e'):
                self.color = self.BLACK

    def on_loop(self):
        if self.mouse_pressed:
            pos = pygame.mouse.get_pos()
            if not self.square_state:
                self.map.set_square(pos[0], pos[1], self.square_state, self.WHITE)
            else:
                self.map.set_square(pos[0], pos[1], self.square_state, self.color)

    def on_render(self):
        self._display_surf.fill(self.WHITE)
        for y, row in enumerate(self.map.squares):
            for x, square_bool in enumerate(row):
                if square_bool:
                    pygame.draw.rect(self._display_surf, self.map.square_colors[y][x],
                                     (self.map.division_size * x, self.map.division_size * y,
                                      self.map.division_size, self.map.division_size))
                else:
                    pygame.draw.rect(self._display_surf, self.GREY,
                                     (self.map.division_size * x, self.map.division_size * y,
                                      self.map.division_size, self.map.division_size), 1)

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


class Map:

    BLACK = (0, 0, 0)
    RED = (255, 0, 0)
    BLUE = (0, 0, 255)

    def __init__(self, width, height, division_size, scale):

        self.width = width
        self.height = height
        self.unscaled_division = division_size
        self.division_size = division_size * scale
        self.scale = scale

        self.squares = [[False for i in range(width // division_size)] for j in range(height // division_size)]
        self.square_colors = [[(255, 255, 255) for i in range(width // division_size)] for j in range(height // division_size)]

    def toggle_square(self, x, y):

        x_coord = x // self.division_size
        y_coord = y // self.division_size

        self.squares[y_coord][x_coord] = not self.squares[y_coord][x_coord]

    def set_square(self, x, y, state, color):

        x_coord = x // self.division_size
        y_coord = y // self.division_size

        self.squares[y_coord][x_coord] = state
        self.square_colors[y_coord][x_coord] = color
        test = True

    def save_map(self):

        walls = []
        for color in [self.BLACK, self.RED, self.BLUE]:
            color_map = self.extract_color_walls(color)
            color_walls = self.get_wall_list_from_color_map(color_map, color)
            walls.extend(color_walls)

        with open('map_files/map_001.json', 'w') as outfile:
            json.dump({"buttons": [], "walls": walls}, outfile, indent=4)

    def get_wall_list_from_color_map(self, color_map, color):

        # start_x, end_x, y
        x_walls = []
        for y, row in enumerate(color_map):
            prev_x = False
            wall_start_x = 0
            for x, x_val in enumerate(row):
                if x_val and not prev_x:  # wall start
                    wall_start_x = x
                    prev_x = x_val
                elif not x_val and prev_x:  # wall end
                    prev_x = False
                    x_walls.append([wall_start_x, x - 1, y])
                    wall_start_x = 0

            if prev_x:
                x_walls.append([wall_start_x, len(row), y])

        # start_y, end_y, x
        y_walls = []
        transposed_squares = list(map(list, zip(*color_map)))
        for x, col in enumerate(transposed_squares):
            prev_y = False
            wall_start_y = 0
            for y, y_val in enumerate(col):
                if y_val and not prev_y:  # wall start
                    wall_start_y = y
                    prev_y = y_val
                elif not y_val and prev_y:  # wall end
                    prev_y = False
                    y_walls.append([wall_start_y, y - 1, x])
                    wall_start_x = 0
            if prev_y:
                y_walls.append([wall_start_y, len(col), x])

        # x, y, width, height, color
        wall_rects = []
        for wall in x_walls:
            if wall[2] - wall[0] > 1:
                wall_rects.append([wall[0] * self.division_size // self.scale,
                                   wall[2] * self.division_size // self.scale,
                                   (wall[1] * self.division_size + self.division_size) // self.scale,
                                   (wall[2] * self.division_size + self.division_size) // self.scale,
                                   '#%02x%02x%02x' % color])
        for wall in y_walls:
            if wall[2] - wall[0] > 1:
                wall_rects.append([wall[2] * self.division_size // self.scale,
                                   wall[0] * self.division_size // self.scale,
                                   (wall[2] * self.division_size + self.division_size) // self.scale,
                                   (wall[1] * self.division_size + self.division_size) // self.scale,
                                   '#%02x%02x%02x' % color])

        return wall_rects

    def extract_color_walls(self, color):

        color_map = []
        for row in self.square_colors:
            temp_row = []
            for val in row:
                if val == color:
                    temp_row.append(True)
                else:
                    temp_row.append(False)
            color_map.append(temp_row)
        return color_map

    def load_map(self):

        squares = [[False for i in range(self.width // self.division_size)] for j in range(self.height // self.division_size)]
        square_colors = [[(255, 255, 255) for i in range(self.width // self.division_size)] for j in
                              range(self.height // self.division_size)]

        with open('map_files/map_001.json', 'r') as jsonfile:
            json_input = json.load(jsonfile)

        for wall in json_input["walls"]:
            hex_color = wall[4].lstrip("#")
            color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            if wall[2] - wall [0] == self.unscaled_division: # y_wall
                start_y = wall[1] // self.unscaled_division
                x = wall [0] // self.unscaled_division
                for i in range((wall[3] - wall[1]) // self.unscaled_division):
                    squares[start_y + i][x] = True
                    square_colors[start_y + i][x] = color
            else: # x_wall
                start_x = wall[0] // self.unscaled_division
                y = wall[1] // self.unscaled_division
                for i in range((wall[2] - wall[0]) // self.unscaled_division):
                    squares[y][start_x + i] = True
                    square_colors[y][start_x + i] = color

        self.squares = squares
        self.square_colors = square_colors
        test = True

if __name__ == "__main__":
    theApp = App()
    theApp.on_execute()
