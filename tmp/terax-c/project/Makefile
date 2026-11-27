ZIG_BIN  := /tmp/terax-c/toolchains/zig/zig
ODIN_BIN := /tmp/terax-c/toolchains/odin/odin
CC       := gcc
CFLAGS   := -std=c11 -O2 -Wall -Wextra -Werror -Wno-format-truncation \
            -I/tmp/terax-c/project/zig \
            -I/tmp/terax-c/project/odin \
            -I/tmp/terax-c/project/backend/include

LDFLAGS  := /tmp/terax-c/project/backend/target/release/libterax_lib.a \
            /tmp/terax-c/project/zig/libterax_zig.a \
            /tmp/terax-c/project/odin/libterax_odin.a \
            -lpthread -ldl -lm -lutil

TUI_SRCS := tui/main.c tui/render.c tui/vt.c tui/editor.c tui/syntax.c \
            tui/explorer.c tui/git_panel.c tui/ai_panel.c tui/palette.c tui/json_min.c

all: /tmp/terax-c/project/terax-c

/tmp/terax-c/project/zig/libterax_zig.a:
	$(ZIG_BIN) build-lib /tmp/terax-c/project/zig/terax_zig.zig \
		-femit-bin=/tmp/terax-c/project/zig/libterax_zig.a \
		-OReleaseFast -lc -fPIC

/tmp/terax-c/project/odin/libterax_odin.a:
	$(ODIN_BIN) build /tmp/terax-c/project/odin \
		-build-mode:static -no-entry-point -o:speed -reloc-mode:pic \
		-out:/tmp/terax-c/project/odin/libterax_odin.a

rust: /tmp/terax-c/project/zig/libterax_zig.a /tmp/terax-c/project/odin/libterax_odin.a
	. "$$HOME/.cargo/env" && cargo build --release --lib --manifest-path /tmp/terax-c/project/backend/Cargo.toml

/tmp/terax-c/project/terax-c: rust $(TUI_SRCS)
	$(CC) $(CFLAGS) $(TUI_SRCS) $(LDFLAGS) -o /tmp/terax-c/project/terax-c

clean:
	rm -f /tmp/terax-c/project/terax-c /tmp/terax-c/project/zig/libterax_zig.a /tmp/terax-c/project/odin/libterax_odin.a
